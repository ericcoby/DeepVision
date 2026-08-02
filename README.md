# DeepVision

Split into two independent pieces so you and a teammate can work in parallel:

```
deepfake-detector/
  backend/     ← the AI side (you)
    app.py           FastAPI server — the only file that defines the API
    model.py          Detection logic (heuristic + optional trained CNN)
    train.py          Script to train a real CNN once you have a dataset
    requirements.txt
  frontend/    ← the web app side (your teammate)
    index.html        Working reference demo — replace/rebuild as needed
```

## Quick start

```bash
cd backend
pip install -r requirements.txt --break-system-packages
uvicorn app:app --reload --port 8000
```

Then open `frontend/index.html` directly in a browser (no build step needed)
and try uploading an image or video. It's already wired up to
`http://localhost:8000/api/detect`.

## How detection works right now

**Primary mode — pretrained model, no training needed.** The API uses
[`dima806/deepfake_vs_real_image_detection`](https://huggingface.co/dima806/deepfake_vs_real_image_detection),
a Vision Transformer from Hugging Face that's specifically fine-tuned to
tell real faces from deepfake faces (not just "AI-generated art" — this
one's built for exactly your use case). On first run, `transformers`
downloads it automatically (~350MB) and caches it locally; every run after
that loads instantly and works fully offline.

For video, it samples ~24 frames evenly across the clip, scores each one
with the model, and averages the results.

**Known limitation (worth a line in your report):** the model's training
data is a few years old, and deepfake generation has moved fast since then
— so accuracy on very recent, high-quality face swaps may be lower than
its original benchmarks. If your evaluation shows this, that's a real,
citable finding, not a bug.

**Fallback mode.** If the pretrained model can't be reached (no internet,
or `torch`/`transformers` not installed), the API automatically falls back
to a frequency-domain (FFT) heuristic that needs no download at all, so the
app never just breaks. You'll see which mode is active in the server logs
and at `GET /health`.

## Want to go further than the pretrained model?

Fine-tuning is possible but optional — the pretrained model is likely
"good enough" for a course project without it. If you want to push
accuracy further (e.g. on a specific dataset your project targets):

1. Get a labeled dataset — [FaceForensics++](https://github.com/ondyari/FaceForensics),
   [Celeb-DF](https://github.com/yuezunli/celeb-deepfakeforensics), or
   [DFDC](https://ai.meta.com/datasets/dfdc/) are the standard ones academic
   projects use.
2. Extract frames and face-crop them into `backend/data/train/{real,fake}/`
   and `backend/data/val/{real,fake}/`.
3. `python train.py --data_dir ./data --epochs 10` — this fine-tunes a
   ResNet18 from scratch as an alternative path.
4. Restart the server — `model.py` auto-detects a checkpoint at
   `backend/weights/model.pt` and prefers it over the default pretrained
   model. No other code changes needed.

## The API contract (for your teammate)

```
POST /api/detect
Content-Type: multipart/form-data
Field: file  (image: .jpg/.jpeg/.png, or video: .mp4/.mov, max 50MB)

200 OK
{ "score": 0.87, "label": "fake", "media_type": "video" }

400 { "error"/"detail": "Unsupported file type" }
413 { "detail": "File exceeds maximum size" }
500 { "detail": "Detection failed, please try again" }
```

`score` is 0–1, higher = more likely fake. `label` is derived from `score`
at a threshold (default 0.5, configurable via the `DEEPFAKE_THRESHOLD`
env var).

Your teammate can build the real frontend against this contract without
waiting on you — `frontend/index.html` is just a working reference/demo,
not the final product. Point them at the README section above plus this
project folder.

## Suggestions for your project report

- Evaluate the heuristic baseline against a labeled dataset and report
  accuracy/precision/recall/ROC-AUC — this alone is a legitimate
  "baseline method" section.
- If you train the CNN (train.py), compare its metrics against the
  heuristic baseline — that comparison is a natural, easy-to-write
  results section.
- Mention the known limitation: this heuristic is tuned by hand rather
  than calibrated on data, and CNN-based methods generally outperform it —
  that's a good "future work" line.
