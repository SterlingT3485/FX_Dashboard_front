import axios, { type AxiosInstance } from "axios";

const BASE_URL = "/api";

// Exchange rate data interface
export interface ExchangeRate {
  [currency: string]: number;
}

// Time series data response interface
export interface TimeSeriesResponse {
  base: string;
  start_date: string;
  end_date: string;
  rates: {
    [date: string]: ExchangeRate;
  };
}

// Currency list response interface
export interface CurrenciesResponse {
  [code: string]: string;
}

// Query parameters interface
export interface RatesQueryParams {
  base?: string; // Base currency
  symbols?: string[]; // Target currency list
}

export interface TimeSeriesQueryParams extends RatesQueryParams {
  start_date: string; // Start date (YYYY-MM-DD)
  end_date?: string; // End date (YYYY-MM-DD), defaults to current date
}

/**
 * API service class
 * Query exchange rate data 
 */
export class FrankfurterAPI {
  // Currency list cache
  private static currenciesCache: CurrenciesResponse | null = null;
  // Cache expiry timestamp
  private static currenciesCacheExpiry: number = 0;
  // Cache duration (milliseconds) - here set to 24 hours
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Allow cross-domain requests to carry credentials
    });

    // Set response interceptor
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error("API request error:", error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get time series exchange rate
   * @param params time series query parameters
   * @returns time series exchange rate data
   */
  async getTimeSeriesRates(
    params: TimeSeriesQueryParams
  ): Promise<TimeSeriesResponse> {
    const { start_date, end_date, base, symbols } = params;

    const queryParams: Record<string, string> = {
      start_date,
      end_date: end_date || "",
    };

    if (base) {
      queryParams.base = base;
    }

    if (symbols && symbols.length > 0) {
      queryParams.symbols = symbols.join(",");
    }

    const response = await this.instance.get(`/timeseries`, {
      params: queryParams,
    });
    return response.data;
  }

  /**
   * Get currency list
   * @returns currency code and full name mapping
   */
  async getCurrencies(): Promise<CurrenciesResponse> {
    // Check if cache exists and fresh
    const now = Date.now();
    if (FrankfurterAPI.currenciesCache && FrankfurterAPI.currenciesCacheExpiry > now) {
      return FrankfurterAPI.currenciesCache;
    }

    // Cache not exists or expired, get data from API
    const response = await this.instance.get("/currencies");
    const currenciesData = response.data;

    // Update cache
    FrankfurterAPI.currenciesCache = currenciesData;
    FrankfurterAPI.currenciesCacheExpiry = now + FrankfurterAPI.CACHE_DURATION;

    return currenciesData;
  }

  /**
   * Clear currency list cache
   * Can be used to force refresh currency data
   */
  static clearCurrenciesCache(): void {
    FrankfurterAPI.currenciesCache = null;
    FrankfurterAPI.currenciesCacheExpiry = 0;
  }

}

export const frankfurterAPI = new FrankfurterAPI();
export const {
  getTimeSeriesRates,
  getCurrencies,
} = frankfurterAPI;

