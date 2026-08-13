const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const CONTEXT_MENU_ID = 'deepvision-scan-image';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Scan image with DeepVision',
    contexts: ['image']
  });
});

async function getBackendUrl() {
  const stored = await chrome.storage.sync.get('backendUrl');
  return (stored.backendUrl || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
}

// Turns the raw {score,label,media_type} backend response into the same
// plain-language summary style used in the main DeepVision web app.
function describeResult(data) {
  const rawScore = typeof data.score === 'number' ? data.score : 0.5;
  const isFake = data.label?.toLowerCase() === 'fake' || rawScore >= 0.5;
  const fakePercent = Math.round(rawScore * 1000) / 10;
  const authPercent = Math.round((1 - rawScore) * 1000) / 10;
  const confidence = isFake ? fakePercent : authPercent;

  return {
    isFake,
    confidence,
    verdict: isFake ? 'Likely AI-Generated or Manipulated' : 'Likely Authentic',
    summary: isFake
      ? `We're ${fakePercent}% confident this image is AI-generated or manipulated.`
      : `We're ${authPercent}% confident this image is genuine and unedited.`
  };
}

async function scanImageUrl(imageUrl) {
  const backendUrl = await getBackendUrl();

  let imageBlob;
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error(`Could not fetch image (HTTP ${imageRes.status})`);
    imageBlob = await imageRes.blob();
  } catch (err) {
    return { error: `Couldn't download that image: ${err.message}` };
  }

  const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
  const formData = new FormData();
  formData.append('file', imageBlob, filename.includes('.') ? filename : `${filename}.jpg`);

  try {
    const res = await fetch(`${backendUrl}/api/detect`, { method: 'POST', body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Backend returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return describeResult(data);
  } catch (err) {
    return { error: `DeepVision backend unreachable at ${backendUrl}: ${err.message}` };
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.srcUrl || !tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { type: 'DEEPVISION_SCANNING' });
  const result = await scanImageUrl(info.srcUrl);
  chrome.tabs.sendMessage(tab.id, { type: 'DEEPVISION_RESULT', result });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DEEPVISION_SCAN_URL') {
    scanImageUrl(message.url).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
});
