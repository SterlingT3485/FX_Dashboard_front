import React, { useMemo } from "react";
import { Select, Button, Spin } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import DateRangePicker from "./DateRangePicker";
import { useCurrencies } from "../utils";
import "./CurrencyFilter.css";
import "./shared/FilterAlignment.css";

interface UnifiedTableFilterProps {
  baseCurrency: string;
  targetCurrency: string | string[];
  onBaseCurrencyChange: (currency: string) => void;
  onTargetCurrencyChange: (currency: string | string[]) => void;
  onSwap: () => void;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  onStartDateChange?: (date: Dayjs | null) => void;
  onEndDateChange?: (date: Dayjs | null) => void;
  onDateRangeChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  allowMultipleTargets?: boolean;
  className?: string;
}

const currencyFlags: { [key: string]: string } = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦",
  CHF: "🇨🇭", CNY: "🇨🇳", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", NZD: "🇳🇿",
  SGD: "🇸🇬", HKD: "🇭🇰", KRW: "🇰🇷", THB: "🇹🇭", MXN: "🇲🇽", ZAR: "🇿🇦",
  INR: "🇮🇳", BRL: "🇧🇷", RUB: "🇷🇺", TRY: "🇹🇷", PLN: "🇵🇱", CZK: "🇨🇿",
  HUF: "🇭🇺", RON: "🇷🇴", BGN: "🇧🇬", HRK: "🇭🇷", ISK: "🇮🇸", ILS: "🇮🇱",
  PHP: "🇵🇭", MYR: "🇲🇾", IDR: "🇮🇩",
};

const UnifiedTableFilter: React.FC<UnifiedTableFilterProps> = ({
  baseCurrency,
  targetCurrency,
  onBaseCurrencyChange,
  onTargetCurrencyChange,
  onSwap,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onDateRangeChange,
  allowMultipleTargets = false,
  className = "",
}) => {
  const { currencyList, loading: currenciesLoading, error: currenciesError } = useCurrencies();

  const currencyOptions = useMemo(() => {
    if (!currencyList || currencyList.length === 0) return [];
    return currencyList.map(({ code, name }) => ({
      value: code,
      label: `${code} - ${name}`,
      flag: currencyFlags[code] || "💱",
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

  const canSwap = allowMultipleTargets
    ? Array.isArray(targetCurrency) && targetCurrency.length === 1
    : true;

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
            notFoundContent={currenciesLoading ? <Spin size="small" /> : "No currencies found"}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase()) ||
              currencyOptions.find((c) => c.value === option?.value)?.label.toLowerCase().includes(input.toLowerCase()) ||
              false
            }
            options={currencyOptions.map(renderOption)}
          />
          {currenciesError && (
            <div style={{ color: "#f5222d", fontSize: 12, marginTop: 4 }}>Currency loading failed: {currenciesError}</div>
          )}
        </div>

        <Button
          type="text"
          icon={<SwapOutlined />}
          onClick={onSwap}
          className="swap-button currency-swap-button"
          size="large"
          title="Swap currencies"
          disabled={!canSwap}
        />

        <div className="filter-component target-currency-filter">
          <label className="filter-label">Target Currency</label>
          <Select
            mode={allowMultipleTargets ? "multiple" : undefined}
            value={targetCurrency}
            onChange={onTargetCurrencyChange}
            className="currency-select target-currency filter-input"
            size="large"
            showSearch
            loading={currenciesLoading}
            disabled={currenciesLoading || !!currenciesError}
            placeholder={currenciesLoading ? "Loading currencies..." : "Select target currency"}
            notFoundContent={currenciesLoading ? <Spin size="small" /> : "No currencies found"}
            maxTagCount={allowMultipleTargets ? 1 : undefined}
            maxTagPlaceholder={allowMultipleTargets ? (omitted) => omitted.length > 0 ? `+${omitted.length} more` : "" : undefined}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase()) ||
              currencyOptions.find((c) => c.value === option?.value)?.label.toLowerCase().includes(input.toLowerCase()) ||
              false
            }
            options={currencyOptions.map(renderOption)}
          />
          {currenciesError && (
            <div style={{ color: "#f5222d", fontSize: 12, marginTop: 4 }}>Currency loading failed: {currenciesError}</div>
          )}
        </div>

        {onStartDateChange && onEndDateChange && (
          <div className="filter-component date-range-filter">
            <DateRangePicker
              startDate={startDate || null}
              endDate={endDate || null}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
              onRangeChange={onDateRangeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedTableFilter;


