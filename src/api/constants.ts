// In dev we proxy through Vite ("/api/v2" -> https://ya-praktikum.tech/api/v2,
// "/ws" -> wss://ya-praktikum.tech) so that the auth cookie lands on
// http://localhost via cookieDomainRewrite.
// In production we hit the API directly: the cookie is stored in the
// ya-praktikum.tech origin and will be sent back automatically with
// xhr.withCredentials = true. CORS is configured by Praktikum.
const PROD_API_HOST = 'https://ya-praktikum.tech';
const PROD_WS_HOST = 'wss://ya-praktikum.tech';

const isDev = import.meta.env.DEV;

const baseUrl = isDev ? '/api/v2' : `${PROD_API_HOST}/api/v2`;

const wsBaseUrl = isDev
  ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
  : `${PROD_WS_HOST}/ws`;

export const API_BASE_URL = baseUrl;
export const RESOURCES_BASE_URL = `${baseUrl}/resources`;
export const WS_BASE_URL = wsBaseUrl;
