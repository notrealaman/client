const VAPID_PUBLIC_KEY = 'BGpWkuXyGtrSpVQC0MdS84VEBKewHWcYOLfXCoTbwheCsrSHJsobXICU697_Kld6O4VT8z7O81mLxa1KM1vOMI4';

function apiUrl(path) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${base}${path}`;
}

async function request(token, url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function keyToBase64(key) {
  const bytes = new Uint8Array(key);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function subscribeUser() {
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub) return sub;

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    await request(token, apiUrl('/push/subscribe'), {
      method: 'POST',
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: { p256dh: keyToBase64(sub.getKey('p256dh')), auth: keyToBase64(sub.getKey('auth')) },
        deviceInfo: navigator.userAgent,
      }),
    });

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
      await request(token, apiUrl('/push/unsubscribe'), {
        method: 'DELETE',
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
    }

    await sub.unsubscribe();
  } catch (err) {
    console.error('Push unsubscribe error:', err);
  }
}
