import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // sends the httpOnly auth cookie automatically on every request
});

// Endpoints that are EXPECTED to return 401 as part of normal, non-fatal
// flows — i.e. routes a logged-out visitor or a user mid-auth-flow can hit
// legitimately. These must never trigger the global redirect below, or:
//   1. A logged-out visit to "/" (which calls /check_authentication) would
//      force-redirect to /login before the landing page can ever render.
//   2. A wrong-password attempt on /login would hard-navigate the page
//      away via window.location.href, wiping out the in-progress form and
//      the toast.error(...) the component was about to show.
const AUTH_EXEMPT_PATHS = [
  '/check_authentication',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
];

const isAuthExempt = (url = '') => AUTH_EXEMPT_PATHS.some((path) => url.includes(path));

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && typeof window !== 'undefined' && !isAuthExempt(requestUrl)) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
