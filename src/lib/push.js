const VAPID_PUBLIC_KEY = 'BGpWkuXyGtrSpVQC0MdS84VEBKewHWcYOLfXCoTbwheCsrSHJsobXICU697_Kld6O4VT8z7O81mLxa1KM1vOMI4';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

async function request(token, url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

export async function subscribeUser() {
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub) return sub;

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const token = localStorage.getItem('token');
    if (!token) return null;

    const subData = sub.toJSON();

    const res = await fetch(`${API_BASE}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: subData.endpoint,
        keys: subData.keys,
        deviceInfo: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Subscribe API error:', err);
      return null;
    }

    return sub;
  } catch (err) {
    if (err.name === 'NotAllowedError') return null;
    console.error('Push subscribe error:', err);
    return null;
  }
}

export async function unsubscribeUser() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    const token = localStorage.getItem('token');
    if (token) {
      const subData = sub.toJSON();
      await fetch(`${API_BASE}/api/push/unsubscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ endpoint: subData.endpoint }),
      }).catch(() => {});
    }

    await sub.unsubscribe();
  } catch (err) {
    console.error('Push unsubscribe error:', err);
  }
}
