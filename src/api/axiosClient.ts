import useUserStore from '@/store/useUserStore';
import axios, {
  type AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const axiosClientWithAuth = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axiosClientWithAuth.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token, anonymousId } = useUserStore.getState();
  if (token) {
    if (!config.headers || typeof (config.headers as AxiosHeaders).set !== 'function') {
      config.headers = new AxiosHeaders(config.headers);
    }
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  } else if (anonymousId) {
    config.params = { ...config.params, id: anonymousId };
  }
  return config;
});

axiosClientWithAuth.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const { config, response } = error;
    // If token is invalid (e.g. expired), clear token and retry request
    if (
      response?.data &&
      typeof response.data === 'object' &&
      'detail' in response.data &&
      (response.data as { detail?: string }).detail === 'Invalid token'
    ) {
      await useUserStore.getState().clearToken();
      const retryConfig = config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (retryConfig && !retryConfig._retry) {
        retryConfig._retry = true;
        return axiosClient(retryConfig);
      }
      // If user is registered but not logged in, force user to login
    } else if (
      response?.data &&
      typeof response.data === 'object' &&
      'detail' in response.data &&
      (response.data as { detail?: string }).detail ===
        'Registered user must use token authentication'
    ) {
      // TODO:Force login (trigger login modal or redirect to login page)
    }
    return Promise.reject(error);
  },
);

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

export { axiosClient, axiosClientWithAuth };
