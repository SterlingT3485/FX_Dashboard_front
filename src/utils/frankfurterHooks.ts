import { useState, useEffect, useCallback, useMemo } from "react";
import {
  frankfurterAPI,
  type TimeSeriesResponse,
  type CurrenciesResponse,
  type TimeSeriesQueryParams,
} from "./frankfurterApi";

// Hook state interface
export interface FrankfurterHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * time series exchange rate data hook
 */
export function useTimeSeriesRates(params: TimeSeriesQueryParams) {
  const [state, setState] = useState<FrankfurterHookState<TimeSeriesResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!params.start_date) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await frankfurterAPI.getTimeSeriesRates(params);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to get time series data",
      });
    }
  }, [
    params.start_date,
    params.end_date,
    params.base,
    params.symbols?.join(","),
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Get currency list hook
 */
export function useCurrencies() {
  const [state, setState] = useState<FrankfurterHookState<CurrenciesResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await frankfurterAPI.getCurrencies();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to get currency list",
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Convert to array
  const currencyList = useMemo(() => {
    if (!state.data) return [];
    return Object.entries(state.data).map(([code, name]) => ({ code, name }));
  }, [state.data]);

  return {
    ...state,
    currencyList,
    refetch: fetchData,
  };
}

