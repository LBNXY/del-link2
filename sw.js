// Clean Link — Service Worker
// 主要工作:接住 Android Web Share Target 送來的 POST 請求(尤其是 IG 影片貼文
// 會夾帶 video/* 檔案,一定是 multipart/form-data,GET 完全接不到),
// 從裡面取出 title / text / url 三個欄位(不需要真的處理影片檔案本身),
// 再導回 index.html?title=...&text=...&url=... 讓既有的前端邏輯照舊接手解析。

const SCOPE_URL = self.registration.scope;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method === 'POST') {
    const url = new URL(req.url);
    // action 設定為 ./index.html,分享進來的 POST 會打到這個路徑
    if (url.pathname.endsWith('/index.html')) {
      event.respondWith(handleShareTarget(req));
      return;
    }
  }
  // 其餘請求一律放行,交給瀏覽器正常處理(不做離線快取,避免影響一般瀏覽行為)
});

async function handleShareTarget(request) {
  const redirectTarget = new URL('./index.html', SCOPE_URL);

  try {
    const formData = await request.formData();

    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const sharedUrl = formData.get('url') || '';
    // formData.get('media') 會是分享進來的圖片/影片檔案,這個工具只處理連結,
    // 所以刻意不讀取、不儲存檔案內容。

    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (text) params.set('text', text);
    if (sharedUrl) params.set('url', sharedUrl);

    redirectTarget.search = params.toString();
  } catch (err) {
    // 解析失敗就單純導回首頁,不中斷使用者流程
  }

  return Response.redirect(redirectTarget.href, 303);
}
