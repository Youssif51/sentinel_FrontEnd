function parseUrl(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLocalAppUrl(url: URL | null) {
  if (!url) return false;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(url.hostname);
  return isLocalhost && url.port === '3000';
}

export function shouldUseRealApi() {
  const apiUrl = parseUrl(process.env.API_URL);
  const appUrl = parseUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (!apiUrl) return false;
  if (isLocalAppUrl(apiUrl)) return false;
  if (appUrl && apiUrl.origin === appUrl.origin) return false;

  return true;
}
