export function buildPdfViewerHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow-x: hidden;
    }
    #viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px 0 80px;
      min-height: 100vh;
    }
    canvas {
      max-width: 100%;
      height: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      background: #fff;
    }
    .page-wrap { position: relative; width: 100%; display: flex; justify-content: center; }
    .highlight {
      position: absolute;
      background: rgba(255, 214, 10, 0.45);
      pointer-events: none;
    }
    body.paged #viewer { gap: 0; }
    body.paged .page-wrap { display: none; }
    body.paged .page-wrap.active { display: flex; }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    let pdfDoc = null;
    let currentPage = 1;
    let scale = 1.2;
    let fitMode = 'width';
    let scrollMode = 'vertical';
    let searchQuery = '';
    let searchMatches = [];
    let searchIndex = -1;
    let renderToken = 0;

    function post(type, payload) {
      const message = JSON.stringify({ type, ...payload });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(message);
      }
    }

    function deviceWidth() {
      return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    async function computeScale(page) {
      const viewport = page.getViewport({ scale: 1 });
      const width = deviceWidth() - 16;
      if (fitMode === 'page') {
        const height = Math.max(window.innerHeight - 24, 320);
        return Math.min(width / viewport.width, height / viewport.height);
      }
      return width / viewport.width;
    }

    async function renderPage(pageNumber, container) {
      const page = await pdfDoc.getPage(pageNumber);
      const pageScale = scale * (await computeScale(page));
      const viewport = page.getViewport({ scale: pageScale });
      const wrap = document.createElement('div');
      wrap.className = 'page-wrap' + (pageNumber === currentPage ? ' active' : '');
      wrap.dataset.page = String(pageNumber);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';
      wrap.appendChild(canvas);
      container.appendChild(wrap);
      await page.render({ canvasContext: context, viewport }).promise;
      return wrap;
    }

    async function renderAll() {
      if (!pdfDoc) return;
      const token = ++renderToken;
      const viewer = document.getElementById('viewer');
      viewer.innerHTML = '';
      document.body.classList.toggle('paged', scrollMode === 'paged');

      if (scrollMode === 'paged') {
        await renderPage(currentPage, viewer);
      } else {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          if (token !== renderToken) return;
          await renderPage(i, viewer);
        }
        const target = viewer.querySelector('[data-page="' + currentPage + '"]');
        if (target) target.scrollIntoView({ block: 'start' });
      }
      post('rendered', { page: currentPage, pageCount: pdfDoc.numPages });
    }

    function updateActivePageFromScroll() {
      if (scrollMode !== 'vertical' || !pdfDoc) return;
      const wraps = Array.from(document.querySelectorAll('.page-wrap'));
      let best = currentPage;
      let bestDist = Infinity;
      wraps.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - 40);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(el.dataset.page);
        }
      });
      if (best !== currentPage) {
        currentPage = best;
        post('page', { page: currentPage });
      }
    }

    window.addEventListener('scroll', () => {
      window.clearTimeout(window.__scrollT);
      window.__scrollT = window.setTimeout(updateActivePageFromScroll, 80);
    }, { passive: true });

    async function loadPdf(base64) {
      const raw = atob(base64);
      const len = raw.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i);
      pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      post('loaded', { pageCount: pdfDoc.numPages });
      currentPage = Math.min(Math.max(currentPage, 1), pdfDoc.numPages);
      await renderAll();
    }

    async function goToPage(page) {
      if (!pdfDoc) return;
      currentPage = Math.min(Math.max(page, 1), pdfDoc.numPages);
      if (scrollMode === 'paged') {
        await renderAll();
      } else {
        const target = document.querySelector('[data-page="' + currentPage + '"]');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else await renderAll();
      }
      post('page', { page: currentPage });
    }

    async function findText(query) {
      searchQuery = (query || '').trim();
      searchMatches = [];
      searchIndex = -1;
      if (!pdfDoc || !searchQuery) {
        post('search', { count: 0, index: -1 });
        return;
      }
      const needle = searchQuery.toLowerCase();
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str).join(' ').toLowerCase();
        if (text.includes(needle)) searchMatches.push(i);
      }
      if (searchMatches.length) {
        searchIndex = 0;
        await goToPage(searchMatches[0]);
      }
      post('search', { count: searchMatches.length, index: searchIndex });
    }

    async function findNext(direction) {
      if (!searchMatches.length) return;
      searchIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length;
      await goToPage(searchMatches[searchIndex]);
      post('search', { count: searchMatches.length, index: searchIndex });
    }

    function handleMessage(data) {
      let msg = data;
      if (typeof data === 'string') {
        try { msg = JSON.parse(data); } catch (e) { return; }
      }
      switch (msg.type) {
        case 'load':
          currentPage = msg.page || 1;
          fitMode = msg.fitMode || fitMode;
          scrollMode = msg.scrollMode || scrollMode;
          scale = msg.scale || scale;
          loadPdf(msg.data);
          break;
        case 'setPage':
          goToPage(msg.page);
          break;
        case 'setFit':
          fitMode = msg.fitMode;
          renderAll();
          break;
        case 'setScrollMode':
          scrollMode = msg.scrollMode;
          renderAll();
          break;
        case 'setScale':
          scale = msg.scale;
          renderAll();
          break;
        case 'zoomIn':
          scale = Math.min(scale * 1.2, 4);
          renderAll();
          post('scale', { scale });
          break;
        case 'zoomOut':
          scale = Math.max(scale / 1.2, 0.5);
          renderAll();
          post('scale', { scale });
          break;
        case 'search':
          findText(msg.query);
          break;
        case 'searchNext':
          findNext(1);
          break;
        case 'searchPrev':
          findNext(-1);
          break;
        default:
          break;
      }
    }

    document.addEventListener('message', (e) => handleMessage(e.data));
    window.addEventListener('message', (e) => handleMessage(e.data));

    document.body.addEventListener('click', () => post('tap', {}));

    let lastTap = 0;
    document.body.addEventListener('touchend', () => {
      const now = Date.now();
      if (now - lastTap < 280) {
        scale = scale > 1.4 ? 1 : scale * 1.6;
        renderAll();
        post('scale', { scale });
      }
      lastTap = now;
    }, { passive: true });

    post('ready', {});
  </script>
</body>
</html>`;
}
