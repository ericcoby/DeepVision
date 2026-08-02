"""
Deepfake detection model wrapper.

Primary mode: PRETRAINED MODEL (no training required)
  Uses dima806/deepfake_vs_real_image_detection, a Vision Transformer from
  Hugging Face fine-tuned specifically on real-vs-deepfake FACE images.
  https://huggingface.co/dima806/deepfake_vs_real_image_detection

  On first run, `transformers` downloads the model (~350MB) and caches it
  locally (~/.cache/huggingface). After that it loads instantly offline.

Fallback mode: FREQUENCY HEURISTIC (used only if the pretrained model can't
  be loaded — e.g. no internet, or transformers/torch not installed). Uses
  FFT spectral analysis to catch GAN upsampling artifacts. Works with zero
  dependencies beyond opencv/numpy, so the API stays usable either way.

Both modes expose the same interface: predict_image() and predict_video(),
each returning a float score in [0, 1] where higher = more likely fake.

NOTE ON ACCURACY: the pretrained model was trained on a deepfake face
dataset collected years ago. Newer generators (2024+ diffusion-based
face swaps) may not be well represented, so expect some concept drift.
This is a known, documented limitation of the model itself — worth
mentioning in your project report if you evaluate against recent data.
"""

import os
import numpy as np
import cv2
from PIL import Image

HF_MODEL_NAME = "dima806/deepfake_vs_real_image_detection"
LOCAL_CHECKPOINT = os.path.join(os.path.dirname(__file__), "weights", "model.pt")


class DeepfakeDetector:
    def __init__(self):
        self.mode = None
        self.pipeline = None

        if os.path.exists(LOCAL_CHECKPOINT):
            # A fine-tuned checkpoint from train.py takes priority, if present.
            try:
                self._load_local_checkpoint()
                self.mode = "finetuned"
            except Exception as e:
                print(f"[model] Found a checkpoint but couldn't load it ({e}). "
                      f"Falling back to the default pretrained model.")

        if self.mode is None:
            try:
                self._load_pretrained()
                self.mode = "pretrained"
            except Exception as e:
                print(f"[model] Could not load pretrained model ({e}). "
                      f"Falling back to frequency-heuristic mode.")
                self.mode = "heuristic"

        print(f"[model] Running in '{self.mode}' mode.")

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
    # Primary: pretrained Hugging Face model
    # ------------------------------------------------------------------
    def _load_pretrained(self):
        from transformers import pipeline
        self.pipeline = pipeline("image-classification", model=HF_MODEL_NAME)

    def _pretrained_score(self, pil_image: Image.Image) -> float:
        results = self.pipeline(pil_image.convert("RGB"))
        # Pipeline returns e.g. [{"label": "Fake", "score": 0.92}, {"label": "Real", "score": 0.08}]
        # Find the "fake" entry regardless of exact casing/label text.
        for r in results:
            if "fake" in r["label"].lower():
                return float(r["score"])
        # Shouldn't happen for a binary classifier, but don't crash if labels differ
        return 1.0 - float(results[0]["score"]) if "real" in results[0]["label"].lower() else float(results[0]["score"])

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
        if self.mode == "pretrained":
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
