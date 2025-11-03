import dayjs, { Dayjs } from "dayjs";

/**
 * Use URL params to store and retrieve filter conditions
 */

export const URL_KEYS = {
  // Current page
  VIEW: "view",
  TABLE: "table",

  // Chart parameters
  CHART_BASE: "chart_base",
  CHART_TARGET: "chart_target",
  CHART_START: "chart_start",
  CHART_END: "chart_end",
  CHART_PERIOD: "chart_period",

  // Date table parameters
  DATE_BASE: "date_base",
  DATE_TARGET: "date_target",
  DATE_START: "date_start",
  DATE_END: "date_end",
  DATE_PAGESIZE: "date_pageSize",

  // Trend table parameters
  TREND_BASE: "trend_base",
  TREND_TARGET: "trend_target",
  TREND_START: "trend_start",
  TREND_END: "trend_end",
  TREND_PAGESIZE: "trend_pageSize",
} as const;

/**
 * Get URL parameters
 */
export function getURLParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Update URL parameters without refreshing
 */
export function updateURLParams(params: Record<string, string | null | undefined>): void {
  const urlParams = getURLParams();
  let hasChanges = false;

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      if (urlParams.has(key)) {
        urlParams.delete(key);
        hasChanges = true;
      }
    } else {
      const currentValue = urlParams.get(key);
      if (currentValue !== value) {
        urlParams.set(key, value);
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    const newURL = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", newURL);
  }
}

/**
 * Get string parameter from URL
 */
export function getStringParam(key: string, defaultValue: string): string {
  const params = getURLParams();
  return params.get(key) || defaultValue;
}

/**
 * Get array parameter from URL
 */
export function getArrayParam(key: string, defaultValue: string[]): string[] {
  const params = getURLParams();
  const value = params.get(key);
  if (!value) return defaultValue;
  return value.split(",").filter(Boolean);
}

/**
 * Get date parameter from URL
 */
export function getDateParam(key: string, defaultValue: Dayjs | null): Dayjs | null {
  const params = getURLParams();
  const value = params.get(key);
  if (!value) return defaultValue;
  const date = dayjs(value);
  return date.isValid() ? date : defaultValue;
}

/**
 * Get number parameter from URL
 */
export function getNumberParam(key: string, defaultValue: number): number {
  const params = getURLParams();
  const value = params.get(key);
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Format date for URL
 */
export function formatDateForURL(date: Dayjs | null): string | null {
  if (!date || !date.isValid()) return null;
  return date.format("YYYY-MM-DD");
}

/**
 * Format array for URL
 */
export function formatArrayForURL(arr: string[]): string | null {
  if (!arr || arr.length === 0) return null;
  return arr.join(",");
}



