(function () {
  const POSITION_KEY = 'deepvision_bubble_pos';
  const VISIBLE_KEY = 'deepvision_bubble_visible';

  let scanModeActive = false;

  chrome.storage.sync.get(VISIBLE_KEY, (stored) => {
    if (stored[VISIBLE_KEY] === false) return; // user hid the bubble via the popup
    init();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes[VISIBLE_KEY]) return;
    const bubble = document.getElementById('deepvision-bubble');
    if (changes[VISIBLE_KEY].newValue === false) {
      bubble?.remove();
    } else if (!bubble) {
      init();
    }
  });

  function init() {
    const bubble = document.createElement('button');
    bubble.id = 'deepvision-bubble';
    bubble.title = 'DeepVision: click, then click any image on this page to scan it';
    bubble.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11z"/></svg>';
    document.documentElement.appendChild(bubble);

    makeDraggable(bubble);
    restorePosition(bubble);

    const hint = document.createElement('div');
    hint.id = 'deepvision-hint';
    hint.textContent = 'Scan mode on — click any image on the page (click the bubble again to cancel)';
    document.documentElement.appendChild(hint);

    bubble.addEventListener('click', (e) => {
      if (bubble.dataset.dragged === 'true') {
        bubble.dataset.dragged = 'false';
        return; // suppress the click that follows a drag
      }
      setScanMode(!scanModeActive);
    });

    document.addEventListener('click', onDocumentClick, true);

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'DEEPVISION_SCANNING') {
        bubble.classList.add('deepvision-loading');
      } else if (message.type === 'DEEPVISION_RESULT') {
        bubble.classList.remove('deepvision-loading');
        showResultCard(message.result, bubble);
      }
    });

    function setScanMode(active) {
      scanModeActive = active;
      bubble.classList.toggle('deepvision-scan-active', active);
      document.documentElement.classList.toggle('deepvision-scan-cursor', active);
      hint.classList.toggle('deepvision-hint-visible', active);
    }

    // Finds an image URL under the click: a real <img>, or (falling back)
    // any ancestor rendering a CSS background-image — a lot of sites (photo
    // grids, carousels, card layouts) render images that way instead of <img>.
    function findImageUrl(startEl) {
      const img = startEl.closest('img');
      if (img && (img.currentSrc || img.src)) return img.currentSrc || img.src;

      let el = startEl;
      for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
        const bg = getComputedStyle(el).backgroundImage;
        const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1]) return match[1];
      }
      return null;
    }

    async function onDocumentClick(e) {
      if (!scanModeActive) return;

      const src = findImageUrl(e.target);
      if (!src) {
        console.log('[DeepVision] No image found at that click point.');
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setScanMode(false);

      bubble.classList.add('deepvision-loading');
      const result = await chrome.runtime.sendMessage({ type: 'DEEPVISION_SCAN_URL', url: src });
      bubble.classList.remove('deepvision-loading');
      showResultCard(result, bubble, e.target);
    }
  }

  function showResultCard(result, bubble, nearEl) {
    document.getElementById('deepvision-result-card')?.remove();

    const card = document.createElement('div');
    card.id = 'deepvision-result-card';

    if (result?.error) {
      card.classList.add('deepvision-error');
      card.innerHTML = `<strong>DeepVision</strong><p>${escapeHtml(result.error)}</p>`;
    } else {
      card.classList.add(result.isFake ? 'deepvision-fake' : 'deepvision-real');
      card.innerHTML = `
        <strong>${escapeHtml(result.verdict)} (${result.confidence}%)</strong>
        <p>${escapeHtml(result.summary)}</p>
      `;
    }

    document.documentElement.appendChild(card);
    positionCard(card, nearEl || bubble);

    const dismiss = (ev) => {
      if (!card.contains(ev.target)) closeCard();
    };
    const closeCard = () => {
      card.remove();
      document.removeEventListener('click', dismiss, true);
    };
    setTimeout(() => document.addEventListener('click', dismiss, true), 0);
    setTimeout(closeCard, 9000);
  }

  function positionCard(card, anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const cardWidth = 280;
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - cardWidth - 8));
    let top = rect.top - 12;
    card.style.left = `${left}px`;
    if (top - 120 > 0) {
      card.style.bottom = `${window.innerHeight - rect.top + 12}px`;
    } else {
      card.style.top = `${rect.bottom + 12}px`;
    }
  }

  function makeDraggable(bubble) {
    let startX, startY, originX, originY, dragging = false;

    bubble.addEventListener('mousedown', (e) => {
      dragging = true;
      bubble.dataset.dragged = 'false';
      startX = e.clientX;
      startY = e.clientY;
      const rect = bubble.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) bubble.dataset.dragged = 'true';

      const x = Math.max(4, Math.min(originX + dx, window.innerWidth - bubble.offsetWidth - 4));
      const y = Math.max(4, Math.min(originY + dy, window.innerHeight - bubble.offsetHeight - 4));
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      if (bubble.dataset.dragged === 'true') {
        chrome.storage.sync.set({
          [POSITION_KEY]: { left: bubble.style.left, top: bubble.style.top }
        });
      }
    });
  }

  function restorePosition(bubble) {
    chrome.storage.sync.get(POSITION_KEY, (stored) => {
      const pos = stored[POSITION_KEY];
      if (pos?.left && pos?.top) {
        bubble.style.left = pos.left;
        bubble.style.top = pos.top;
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
