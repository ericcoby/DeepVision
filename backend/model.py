"""
Deepfake detection model wrapper.

Primary mode: PRETRAINED MODELS (no training required) — two Vision
  Transformers from Hugging Face, run together so each covers the other's
  blind spot:

  1. dima806/deepfake_vs_real_image_detection — fine-tuned on face-swap
     deepfakes (FaceForensics++-era data). Good at classic face swaps,
     but was never trained on fully AI-generated images, so it tends to
     call diffusion-generated pictures (Midjourney/DALL-E/Stable
     Diffusion/etc.) "real" since nothing about them looks like a swapped
     face specifically.
     https://huggingface.co/dima806/deepfake_vs_real_image_detection

  2. dima806/ai_vs_human_generated_image_detection — fine-tuned to tell
     apart fully AI-generated images from real photos in general (not
     face-specific). Covers the case the face-swap model misses.
     https://huggingface.co/dima806/ai_vs_human_generated_image_detection

  The final score is the max of the two, so a media file is flagged if
  *either* model finds it suspicious.

  On first run, `transformers` downloads each model (~350MB) and caches
  them locally (~/.cache/huggingface). After that they load instantly
  offline.

Fallback mode: FREQUENCY HEURISTIC (used only if neither pretrained model
  can be loaded — e.g. no internet, or transformers/torch not installed).
  Uses FFT spectral analysis to catch GAN upsampling artifacts. Works with
  zero dependencies beyond opencv/numpy, so the API stays usable either way.

Both modes expose the same interface: predict_image() and predict_video(),
each returning a float score in [0, 1] where higher = more likely fake.

NOTE ON ACCURACY: both pretrained models were trained on datasets collected
a while back. The newest generators may not be well represented, so expect
some concept drift. This is a known, documented limitation of the models
themselves — worth mentioning in your project report if you evaluate
against very recent data.
"""

import os
import numpy as np
import cv2
from PIL import Image

FACESWAP_MODEL_NAME = "dima806/deepfake_vs_real_image_detection"
GENERAL_AI_MODEL_NAME = "dima806/ai_vs_human_generated_image_detection"
LOCAL_CHECKPOINT = os.path.join(os.path.dirname(__file__), "weights", "model.pt")


class DeepfakeDetector:
    def __init__(self):
        self.mode = None
        self.faceswap_pipeline = None
        self.general_pipeline = None

        if os.path.exists(LOCAL_CHECKPOINT):
            # A fine-tuned checkpoint from train.py takes priority, if present.
            try:
                self._load_local_checkpoint()
                self.mode = "finetuned"
            except Exception as e:
                print(f"[model] Found a checkpoint but couldn't load it ({e}). "
                      f"Falling back to the default pretrained models.")

        if self.mode is None:
            self._load_faceswap_model()
            self.mode = "pretrained" if self.faceswap_pipeline else "heuristic"
            # The general AI-image model is a separate ~350MB download. Fetch it
            # on a background thread so a slow/first-time download never blocks
            # server startup or requests — it attaches itself once ready.
            import threading
            threading.Thread(target=self._load_general_model, daemon=True).start()

        active = []
        if self.faceswap_pipeline:
            active.append("faceswap")
        if self.general_pipeline:
            active.append("general-ai")
        print(f"[model] Running in '{self.mode}' mode. Active sub-models: {active or 'none'} "
              f"(general-ai model, if not yet listed, is still downloading in the background).")

    def _load_local_checkpoint(self):
        import torch
        import torchvision.models as models
        import torchvision.transforms as T

        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        net = models.resnet18(weights=None)
        net.fc = torch.nn.Linear(net.fc.in_features, 1)
        state = torch.load(LOCAL_CHECKPOINT, map_location=self.device)
        net.load_state_dict(state)
        net.eval()
        self.finetuned_net = net.to(self.device)

        self.finetuned_transform = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _finetuned_score(self, pil_image: Image.Image) -> float:
        with self.torch.no_grad():
            x = self.finetuned_transform(pil_image.convert("RGB")).unsqueeze(0).to(self.device)
            logit = self.finetuned_net(x)
            score = self.torch.sigmoid(logit).item()
        return float(score)

    # ------------------------------------------------------------------
    # Primary: pretrained Hugging Face models
    # ------------------------------------------------------------------
    def _load_faceswap_model(self):
        from transformers import pipeline

        try:
            self.faceswap_pipeline = pipeline("image-classification", model=FACESWAP_MODEL_NAME)
        except Exception as e:
            print(f"[model] Could not load face-swap model ({e}).")

    def _load_general_model(self):
        import time
        from transformers import pipeline

        retry_delay_s = 300
        while self.general_pipeline is None:
            try:
                self.general_pipeline = pipeline("image-classification", model=GENERAL_AI_MODEL_NAME)
                print("[model] General AI-image model finished downloading and is now active.")
            except Exception as e:
                print(f"[model] Could not load general AI-image model ({e}). "
                      f"Retrying in {retry_delay_s}s (likely a network hiccup on a ~350MB download).")
                time.sleep(retry_delay_s)

    @staticmethod
    def _fake_score_from_results(results, fake_keywords, real_keywords) -> float:
        # Pipeline returns e.g. [{"label": "Fake", "score": 0.92}, {"label": "Real", "score": 0.08}]
        # Match label text loosely since each checkpoint names its classes differently.
        for r in results:
            label = r["label"].lower()
            if any(k in label for k in fake_keywords):
                return float(r["score"])
            if any(k in label for k in real_keywords):
                return 1.0 - float(r["score"])
        # Shouldn't happen for a binary classifier, but don't crash if labels are unrecognized
        return float(results[0]["score"])

    def _pretrained_score(self, pil_image: Image.Image) -> float:
        rgb_image = pil_image.convert("RGB")
        scores = []

        if self.faceswap_pipeline:
            results = self.faceswap_pipeline(rgb_image)
            scores.append(self._fake_score_from_results(results, ["fake"], ["real"]))

        if self.general_pipeline:
            results = self.general_pipeline(rgb_image)
            scores.append(self._fake_score_from_results(results, ["ai"], ["human", "real"]))
        else:
            # The general AI-image model hasn't finished downloading yet (or failed to).
            # Use the zero-dependency FFT heuristic as a temporary stand-in so images
            # with no face in them (which the face-swap model can't judge) still get a
            # real signal instead of defaulting to "authentic". Stops being used the
            # moment the background download completes and general_pipeline is set.
            scores.append(self._heuristic_score(rgb_image))

        # Flag as fake if either specialist model finds it suspicious.
        return max(scores)

    # ------------------------------------------------------------------
    # Fallback: FFT spectral artifact analysis (no download/internet needed)
    # ------------------------------------------------------------------
    def _heuristic_score(self, pil_image: Image.Image) -> float:
        img = np.array(pil_image.convert("L"))
        img = cv2.resize(img, (256, 256))

        f = np.fft.fft2(img)
        fshift = np.fft.fftshift(f)
        magnitude = np.log(np.abs(fshift) + 1e-8)

        h, w = magnitude.shape
        cy, cx = h // 2, w // 2
        y, x = np.indices((h, w))
        r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2).astype(int)

        radial_profile = np.bincount(r.ravel(), magnitude.ravel()) / np.bincount(r.ravel())
        radial_profile = radial_profile[: min(cx, cy)]

        if len(radial_profile) < 10:
            return 0.5

        profile = radial_profile - radial_profile.min()
        if profile.max() > 0:
            profile = profile / profile.max()

        hf_ratio = profile[int(len(profile) * 0.66):].mean() / (profile.mean() + 1e-8)
        smoothed = np.convolve(profile, np.ones(5) / 5, mode="valid")
        roughness = np.var(np.diff(np.diff(smoothed)))

        raw = 0.6 * hf_ratio + 400 * roughness
        score = 1 / (1 + np.exp(-4 * (raw - 1.0)))
        return float(np.clip(score, 0.0, 1.0))

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------
    def predict_image_array(self, pil_image: Image.Image) -> float:
        if self.mode == "finetuned":
            return self._finetuned_score(pil_image)
        # Check the pipelines directly (not just self.mode) so the general-ai
        # model gets used as soon as its background download finishes, even
        # if it wasn't ready yet when the server started.
        if self.faceswap_pipeline or self.general_pipeline:
            return self._pretrained_score(pil_image)
        return self._heuristic_score(pil_image)

    def predict_image(self, path: str) -> float:
        pil_image = Image.open(path)
        return self.predict_image_array(pil_image)

    def predict_video(self, path: str, max_frames: int = 24) -> float:
        cap = cv2.VideoCapture(path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            raise ValueError("Could not read any frames from video")

        step = max(1, total_frames // max_frames)
        scores = []

        frame_idx = 0
        read_count = 0
        while cap.isOpened() and read_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            if frame_idx % step == 0:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_frame = Image.fromarray(rgb)
                scores.append(self.predict_image_array(pil_frame))
                read_count += 1
            frame_idx += 1

        cap.release()

        if not scores:
            raise ValueError("Could not extract usable frames from video")

        return float(np.mean(scores))


# Singleton instance the API layer imports
detector = DeepfakeDetector()
