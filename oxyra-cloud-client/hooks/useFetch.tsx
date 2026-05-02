'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type UseFetchOptions = {
  auto?: boolean;
  url?: string;
  method?: string;
  payload?: any;
  headers?: Record<string, string>;
  withAuth?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (err: any) => void;
};

type RefetchOptions = Partial<Omit<UseFetchOptions, 'auto'>>;

type UseFetchReturn<T = any> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: (overrideOptions?: RefetchOptions) => Promise<void>;
};

export default function useFetch<T = any>({
  auto = false,
  url = '',
  method = 'GET',
  payload = null,
  headers = {},
  withAuth = true,
  onSuccess = () => {},
  onError = () => {},
}: UseFetchOptions = {}): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keep latest values in refs so refetch() always uses up-to-date info
  const latestConfigRef = useRef<UseFetchOptions>({
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

  const refetch = useCallback(async (overrideOptions: RefetchOptions = {}) => {
    const {
      url: reqUrl = latestConfigRef.current.url,
      method: reqMethod = latestConfigRef.current.method,
      payload: reqPayload = latestConfigRef.current.payload,
      headers: reqHeaders = latestConfigRef.current.headers,
      withAuth: reqWithAuth = latestConfigRef.current.withAuth,
      onSuccess: _successCallback,
      onError: _errorCallback,
    } = overrideOptions;

    // Always use a defined callback
    const successCallback = _successCallback ?? latestConfigRef.current.onSuccess ?? (() => {});
    const errorCallback = _errorCallback ?? latestConfigRef.current.onError ?? (() => {});

    if (!reqUrl) return;

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

      if (reqWithAuth) {
        (fetchOptions as any).credentials = 'include';
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