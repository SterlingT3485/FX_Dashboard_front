import React, { useMemo } from "react";
import { Select, Button, Radio, Spin } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import DateRangePicker from "./DateRangePicker";
import { useCurrencies } from "../utils";
import "./CurrencyFilter.css";
import "./shared/FilterAlignment.css";

interface CurrencyFilterProps {
  baseCurrency: string;
  targetCurrency: string | string[];
  onBaseCurrencyChange: (currency: string) => void;
  onTargetCurrencyChange: (currency: string | string[]) => void;
  onSwap: () => void;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  onStartDateChange?: (date: Dayjs | null) => void;
  onEndDateChange?: (date: Dayjs | null) => void;
  timePeriod?: string;
  onTimePeriodChange?: (period: string) => void;
  className?: string;
}

// Currency flags
const currencyFlags: { [key: string]: string } = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  NZD: "🇳🇿",
  SGD: "🇸🇬",
  HKD: "🇭🇰",
  KRW: "🇰🇷",
  THB: "🇹🇭",
  MXN: "🇲🇽",
  ZAR: "🇿🇦",
  INR: "🇮🇳",
  BRL: "🇧🇷",
  RUB: "🇷🇺",
  TRY: "🇹🇷",
  PLN: "🇵🇱",
  CZK: "🇨🇿",
  HUF: "🇭🇺",
  RON: "🇷🇴",
  BGN: "🇧🇬",
  HRK: "🇭🇷",
  ISK: "🇮🇸",
  ILS: "🇮🇱",
  PHP: "🇵🇭",
  MYR: "🇲🇾",
  IDR: "🇮🇩",
};

const CurrencyFilter: React.FC<CurrencyFilterProps> = ({
  baseCurrency,
  targetCurrency,
  onBaseCurrencyChange,
  onTargetCurrencyChange,
  onSwap,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  timePeriod = "day",
  onTimePeriodChange,
  className = "",
}) => {
  // Get currency list
  const {
    currencyList,
    loading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();

  const timePeriodOptions = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  // Add flags and format
  const currencyOptions = useMemo(() => {
    if (!currencyList || currencyList.length === 0) {
      return [];
    }

    return currencyList.map(({ code, name }) => ({
      value: code,
      label: `${code} - ${name}`,
      flag: currencyFlags[code] || "💱", // If no corresponding flag, use this
    }));
  }, [currencyList]);

  const renderOption = (option: (typeof currencyOptions)[0]) => ({
    value: option.value,
    label: (
      <div className="currency-option">
        <span className="currency-flag">{option.flag}</span>
        <span className="currency-code">{option.value}</span>
        <span className="currency-name">{option.label.split(" - ")[1]}</span>
      </div>
    ),
  });

  return (
    <div className={`currency-filter ${className}`}>
      <div className="filter-alignment-wrapper">
        <div className="filter-component base-currency-filter">
          <label className="filter-label">Base Currency</label>
          <Select
            value={baseCurrency}
            onChange={onBaseCurrencyChange}
            className="currency-select base-currency filter-input"
            size="large"
            showSearch
            loading={currenciesLoading}
            disabled={currenciesLoading || !!currenciesError}
            placeholder={currenciesLoading ? "Loading currencies..." : "Select base currency"}
            notFoundContent={
              currenciesLoading ? <Spin size="small" /> : "No currencies found"
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase()) ||
              currencyOptions
                .find((curr) => curr.value === option?.value)
                ?.label.toLowerCase()
                .includes(input.toLowerCase()) ||
              false
            }
            options={currencyOptions.map(renderOption)}
          />
          {currenciesError && (
            <div
              style={{ color: "#f5222d", fontSize: "12px", marginTop: "4px" }}
            >
              Currency loading failed: {currenciesError}
            </div>
          )}
        </div>

        <Button
          type="text"
          icon={<SwapOutlined />}
          onClick={onSwap}
          className="swap-button currency-swap-button"
          size="large"
          title="Swap currencies"
          disabled={Array.isArray(targetCurrency) && targetCurrency.length > 1}
        />

        <div className="filter-component target-currency-filter">
          <label className="filter-label">Target Currency</label>
          <Select
            mode="multiple"
            value={targetCurrency}
            onChange={onTargetCurrencyChange}
            className="currency-select target-currency filter-input"
            size="large"
            showSearch
            loading={currenciesLoading}
            disabled={currenciesLoading || !!currenciesError}
            placeholder={currenciesLoading ? "Loading currencies..." : "Select target currency"}
            notFoundContent={
              currenciesLoading ? <Spin size="small" /> : "No currencies found"
            }
            maxTagCount={1}
            maxTagPlaceholder={(omittedValues) =>
              omittedValues.length > 0 ? `+${omittedValues.length} more` : ""
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase()) ||
              currencyOptions
                .find((curr) => curr.value === option?.value)
                ?.label.toLowerCase()
                .includes(input.toLowerCase()) ||
              false
            }
            options={currencyOptions.map(renderOption)}
          />
          {currenciesError && (
            <div
              style={{ color: "#f5222d", fontSize: "12px", marginTop: "4px" }}
            >
              Currency loading failed: {currenciesError}
            </div>
          )}
        </div>

        {/* Date selection */}
        {onStartDateChange && onEndDateChange && (
          <div className="filter-component date-range-filter">
            <DateRangePicker
              startDate={startDate || null}
              endDate={endDate || null}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
            />
          </div>
        )}

        {/* Time period selection area */}
        {onTimePeriodChange && (
          <div className="time-period-section">
            <label className="currency-label">Period</label>
            <Radio.Group
              options={timePeriodOptions}
              onChange={(e) => onTimePeriodChange(e.target.value)}
              value={timePeriod}
              optionType="button"
              buttonStyle="solid"
              size="large"
              className="time-period-group"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyFilter;
