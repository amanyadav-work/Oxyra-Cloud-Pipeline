'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type UseFetchOptions<TPayload = any> = {
  auto?: boolean;
  url?: string;
  method?: string;
  payload?: TPayload | null;
  headers?: Record<string, string>;
  withAuth?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

type RefetchOptions<TPayload = any> = Partial<UseFetchOptions<TPayload>>;

type UseFetchReturn<TData = any> = {
  data: TData | null;
  error: string | null;
  isLoading: boolean;
  refetch: (overrideOptions?: RefetchOptions) => Promise<void>;
};

export default function useFetch<TData = any, TPayload = any>({
  auto = false,
  url = '',
  method = 'GET',
  payload = null,
  headers = {},
  withAuth = true,
  onSuccess = () => {},
  onError = () => {},
}: UseFetchOptions<TPayload> = {}): UseFetchReturn<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent multiple calls for a single webhook/parent trigger
  const isFetchingRef = useRef(false);

  // Keep latest values in refs so refetch() always uses up-to-date info
  const latestConfigRef = useRef({
    url,
    method,
    payload,
    headers,
    withAuth,
    onSuccess,
    onError,
  });

  // Update config refs on every render
  useEffect(() => {
    latestConfigRef.current = {
      url,
      method,
      payload,
      headers,
      withAuth,
      onSuccess,
      onError,
    };
  }, [url, method, payload, headers, withAuth, onSuccess, onError]);

  const refetch = useCallback(async (overrideOptions: RefetchOptions<TPayload> = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const {
      url: reqUrl = latestConfigRef.current.url,
      method: reqMethod = latestConfigRef.current.method,
      payload: reqPayload = latestConfigRef.current.payload,
      headers: reqHeaders = latestConfigRef.current.headers,
      withAuth: reqWithAuth = latestConfigRef.current.withAuth,
      onSuccess: successCallback = latestConfigRef.current.onSuccess,
      onError: errorCallback = latestConfigRef.current.onError,
    } = overrideOptions;

    if (!reqUrl) {
      isFetchingRef.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalHeaders = { ...reqHeaders };
      const isFormData = reqPayload instanceof FormData;
      if (!isFormData && reqMethod !== 'GET') {
        finalHeaders['Content-Type'] = 'application/json';
      }

      const fetchOptions: RequestInit = {
        method: reqMethod,
        headers: finalHeaders,
        body: reqMethod !== 'GET'
          ? (isFormData ? reqPayload : JSON.stringify(reqPayload))
          : undefined,
      };

      // ✅ Conditionally include credentials (for HTTP-only auth cookies)
      if (reqWithAuth) {
        fetchOptions.credentials = 'include';
      }

      const response = await fetch(reqUrl, fetchOptions);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const result = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = result?.error?.message || result?.message || 'Something went wrong';
        throw { message: errorMessage, fullError: result.error, status: response.status };
      }

      setData(result);
      successCallback(result);
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      setError(message);
      errorCallback(err.fullError || err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Only fire auto-fetch if `auto === true` and `url` is valid on first render
  useEffect(() => {
    if (auto && url) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}