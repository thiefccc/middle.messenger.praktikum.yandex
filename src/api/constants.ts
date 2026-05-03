// In dev we proxy through Vite ("/api/v2" -> https://ya-praktikum.tech/api/v2)
// so that the auth cookie lands on http://localhost via cookieDomainRewrite.
// In production we hit the API directly: the cookie is stored in the
// ya-praktikum.tech origin and will be sent back automatically with
// xhr.withCredentials = true. CORS is configured by Praktikum.
const PROD_API_HOST = 'https://ya-praktikum.tech';

const baseUrl = import.meta.env.DEV
  ? '/api/v2'
  : `${PROD_API_HOST}/api/v2`;

export const API_BASE_URL = baseUrl;
export const RESOURCES_BASE_URL = `${baseUrl}/resources`;
