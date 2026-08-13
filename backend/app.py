"""
Deepfake detection API.

Endpoint: POST /api/detect
  - multipart/form-data, field name "file"
  - accepts image (.jpg/.jpeg/.png) or video (.mp4/.mov)
  - returns { "score": float, "label": "real"|"fake", "media_type": "image"|"video" }

Run locally:
  pip install -r requirements.txt --break-system-packages
  uvicorn app:app --reload --port 8000

Then test:
  curl -X POST -F "file=@some_photo.jpg" http://localhost:8000/api/detect
"""

import os
import tempfile
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from model import detector

app = FastAPI(title="DeepVision")

# Allow the frontend (running on a different port/origin during dev) to call this API.
# Tighten this to your actual frontend domain before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
VIDEO_EXTS = {".mp4", ".mov"}
MAX_FILE_SIZE_MB = 50
THRESHOLD = float(os.environ.get("DEEPFAKE_THRESHOLD", "0.5"))


@app.get("/health")
def health():
    active = []
    if detector.faceswap_pipeline:
        active.append("faceswap")
    if detector.general_pipeline:
        active.append("general-ai")
    return {"status": "ok", "model_mode": detector.mode, "active_submodels": active}


@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()

    if ext not in IMAGE_EXTS | VIDEO_EXTS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    media_type = "image" if ext in IMAGE_EXTS else "video"

    # Stream to a temp file and enforce a size limit while reading,
    # rather than loading the whole upload into memory first.
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    size = 0
    try:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                tmp.close()
                os.unlink(tmp.name)
                raise HTTPException(status_code=413, detail="File exceeds maximum size")
            tmp.write(chunk)
        tmp.close()

        try:
            if media_type == "image":
                score = detector.predict_image(tmp.name)
            else:
                score = detector.predict_video(tmp.name)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Detection failed, please try again") from e

        label = "fake" if score >= THRESHOLD else "real"
        return JSONResponse({
            "score": round(score, 4),
            "label": label,
            "media_type": media_type,
        })
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)
