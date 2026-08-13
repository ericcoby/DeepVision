import { LandmarkPoint } from '../types';

// Generate 68 standard facial landmark coordinates mapped to normalized 0-100% space
export function generateFacialLandmarks(seed: number = 42): LandmarkPoint[] {
  const points: LandmarkPoint[] = [];

  // Jawline (17 points)
  for (let i = 0; i < 17; i++) {
    const angle = (Math.PI / 16) * i;
    points.push({
      x: 50 + Math.sin(angle - Math.PI / 2) * 28 + (Math.sin(i + seed) * 0.5),
      y: 35 + Math.cos(angle - Math.PI / 2) * 32,
      confidence: 0.96 + (Math.sin(i * 1.5) * 0.03)
    });
  }

  // Left Eyebrow (5 points)
  for (let i = 0; i < 5; i++) {
    points.push({
      x: 32 + (i * 3.5),
      y: 38 - Math.sin((i / 4) * Math.PI) * 3,
      confidence: 0.98
    });
  }

  // Right Eyebrow (5 points)
  for (let i = 0; i < 5; i++) {
    points.push({
      x: 53 + (i * 3.5),
      y: 38 - Math.sin((i / 4) * Math.PI) * 3,
      confidence: 0.98
    });
  }

  // Nose Bridge & Tip (9 points)
  for (let i = 0; i < 4; i++) {
    points.push({ x: 50, y: 41 + (i * 2.5), confidence: 0.99 });
  }
  for (let i = 0; i < 5; i++) {
    points.push({ x: 44 + (i * 3), y: 52, confidence: 0.97 });
  }

  // Left Eye (6 points)
  const leftEyeCenter = { x: 38, y: 44 };
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    points.push({
      x: leftEyeCenter.x + Math.cos(angle) * 4,
      y: leftEyeCenter.y + Math.sin(angle) * 2.5,
      confidence: 0.99
    });
  }

  // Right Eye (6 points)
  const rightEyeCenter = { x: 62, y: 44 };
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    points.push({
      x: rightEyeCenter.x + Math.cos(angle) * 4,
      y: rightEyeCenter.y + Math.sin(angle) * 2.5,
      confidence: 0.99
    });
  }

  // Outer Mouth (12 points)
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i;
    points.push({
      x: 50 + Math.cos(angle) * 10,
      y: 62 + Math.sin(angle) * 5,
      confidence: 0.95
    });
  }

  // Inner Mouth (8 points)
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    points.push({
      x: 50 + Math.cos(angle) * 6,
      y: 62 + Math.sin(angle) * 3,
      confidence: 0.94
    });
  }

  return points;
}

// Convert a File object to base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Format milliseconds into mm:ss.ms
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// Generate a lightweight, persistent thumbnail (JPEG data URL) from a File or image/video URL
export async function generateMediaThumbnail(fileOrUrl: File | string, maxDim = 200): Promise<string> {
  return new Promise((resolve) => {
    if (typeof fileOrUrl !== 'string' && fileOrUrl.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(fileOrUrl);
      video.src = objectUrl;

      let resolved = false;
      const captureFrame = () => {
        if (resolved) return;
        resolved = true;
        try {
          const canvas = document.createElement('canvas');
          let width = video.videoWidth || 200;
          let height = video.videoHeight || 200;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
            URL.revokeObjectURL(objectUrl);
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.error('Video frame thumbnail error:', e);
        }
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      video.onloadeddata = () => {
        video.currentTime = 0.5;
      };
      video.onseeked = captureFrame;
      video.onerror = () => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(objectUrl);
          resolve('');
        }
      };
      setTimeout(() => {
        if (!resolved) {
          captureFrame();
        }
      }, 1000);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || 200;
        let height = img.height || 200;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
          return;
        }
      } catch (e) {
        console.error('Image thumbnail error:', e);
      }
      resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
    };
    img.onerror = () => {
      resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
    };

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrUrl);
    }
  });
}

