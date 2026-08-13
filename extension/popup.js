const urlInput = document.getElementById('backendUrl');
const showBubbleInput = document.getElementById('showBubble');
const status = document.getElementById('status');

chrome.storage.sync.get(['backendUrl', 'deepvision_bubble_visible'], (stored) => {
  urlInput.value = stored.backendUrl || 'http://localhost:8000';
  showBubbleInput.checked = stored.deepvision_bubble_visible !== false;
});

document.getElementById('save').addEventListener('click', () => {
  const backendUrl = urlInput.value.trim() || 'http://localhost:8000';
  chrome.storage.sync.set(
    {
      backendUrl,
      deepvision_bubble_visible: showBubbleInput.checked
    },
    () => {
      status.textContent = 'Saved.';
      setTimeout(() => (status.textContent = ''), 1500);
    }
  );
});
