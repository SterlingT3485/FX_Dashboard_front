import React, { useState, useMemo, useRef, useEffect } from "react";
import { Alert } from "antd";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeDark } from "ag-grid-community";
import dayjs, { Dayjs } from "dayjs";
import UnifiedTableFilter from "./UnifiedTableFilter";
import { useTimeSeriesRates, useCurrencies } from "../utils";
import {
  URL_KEYS,
  getStringParam,
  getArrayParam,
  getDateParam,
  getNumberParam,
  updateURLParams,
  formatDateForURL,
  formatArrayForURL,
} from "../utils/urlParams";

ModuleRegistry.registerModules([AllCommunityModule]);

const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({ backgroundColor: "transparent" });

interface DateTableDataType {
  date: string;
  baseCurrency: string;
  [key: string]: string | number;
}

const ExchangeRateByDate: React.FC = () => {
  // Initialize from URL params
  const [baseCurrency, setBaseCurrency] = useState(
    getStringParam(URL_KEYS.DATE_BASE, "USD")
  );
  const [targetCurrency, setTargetCurrency] = useState<string[]>(
    getArrayParam(URL_KEYS.DATE_TARGET, ["EUR"])
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.DATE_START, dayjs().subtract(30, "day"))
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.DATE_END, dayjs())
  );
  const [pageSize, setPageSize] = useState(
    getNumberParam(URL_KEYS.DATE_PAGESIZE, 20)
  );

  // Update URL when state changes
  useEffect(() => {
    updateURLParams({
      [URL_KEYS.DATE_BASE]: baseCurrency,
      [URL_KEYS.DATE_TARGET]: formatArrayForURL(targetCurrency),
      [URL_KEYS.DATE_START]: formatDateForURL(startDate),
      [URL_KEYS.DATE_END]: formatDateForURL(endDate),
      [URL_KEYS.DATE_PAGESIZE]: pageSize.toString(),
    });
  }, [baseCurrency, targetCurrency, startDate, endDate, pageSize]);

  // Get currency list
  const { currencyList } = useCurrencies();

  // Get exchange rate data
  const { data: timeSeriesData, loading, error } = useTimeSeriesRates({
    base: baseCurrency,
    symbols: targetCurrency,
    start_date: startDate?.format('YYYY-MM-DD') || '',
    end_date: endDate?.format('YYYY-MM-DD') || '',
  });

  const handleSwap = () => {
    if (Array.isArray(targetCurrency) && targetCurrency.length === 1) {
      const temp = baseCurrency;
      setBaseCurrency(targetCurrency[0]);
      setTargetCurrency([temp]);
    }
  };

  const gridRef = useRef<AgGridReact>(null);

  const columnDefs: ColDef[] = useMemo(() => {
    const getCurrencyName = (code: string) => currencyList?.find((c) => c.code === code)?.name || code;
    const baseColumns: ColDef[] = [
      {
        field: "date",
        headerName: "Date",
        width: 120,
        pinned: "left",
        sortable: true,
        sort: "desc" as const,
        comparator: (a: string, b: string) => dayjs(a).unix() - dayjs(b).unix(),
        cellStyle: { textAlign: "center" },
      },
      {
        field: "baseCurrency",
        headerName: getCurrencyName(baseCurrency),
        width: 150,
        pinned: "left",
        cellRenderer: () => "1",
        cellStyle: { textAlign: "center" },
      },
    ];

    // Add columns for each target currency
    const targetColumns: ColDef[] = targetCurrency.map((currency) => ({
      field: currency,
      headerName: getCurrencyName(currency),
      width: 150,
      valueFormatter: (params: ValueFormatterParams) => (params.value as number)?.toFixed(4) || "-",
      sortable: true,
      comparator: (a: number, b: number) => (a || 0) - (b || 0),
      cellStyle: { textAlign: "center" },
    }));

    return [...baseColumns, ...targetColumns];
  }, [baseCurrency, targetCurrency, currencyList]);

  // Generate full table data
  const fullTableData = useMemo(() => {
    if (!timeSeriesData || !timeSeriesData.rates) return [] as DateTableDataType[];
    const dates = Object.keys(timeSeriesData.rates).sort().reverse();

    return dates.map((date) => {
      const row: DateTableDataType = { date, baseCurrency };
      targetCurrency.forEach((currency) => { row[currency] = timeSeriesData.rates[date]?.[currency] || 0; });
      return row;
    });
  }, [timeSeriesData, baseCurrency, targetCurrency]);

  const handlePaginationChanged = () => {
    if (gridRef.current?.api) {
      const currentPageSize = gridRef.current.api.paginationGetPageSize();
      setPageSize(currentPageSize);
    }
  };

  // Reset page number to 1 when filtering conditions change
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.paginationGoToPage(0);
    }
  }, [baseCurrency, targetCurrency, startDate, endDate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        className='tech-table-title'
        style={{
          flexShrink: 0,
          height: "40px",
          margin: "0 0 16px 0",
          lineHeight: "40px",
        }}
      >
        Exchange Rate by Date
      </h3>

      {/* Filter */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <UnifiedTableFilter
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          onBaseCurrencyChange={setBaseCurrency}
          onTargetCurrencyChange={(currency: string | string[]) => {
            if (Array.isArray(currency)) {
              setTargetCurrency(currency);
            } else {
              setTargetCurrency([currency]);
            }
          }}
          onSwap={handleSwap}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          allowMultipleTargets={true}
        />
      </div>

      {/* Error message */}
      {error && (
        <div style={{ flexShrink: 0, marginBottom: 16 }}>
          <Alert
            title="Failed to load exchange rate data"
            description={error}
            type="error"
            showIcon
            style={{
              backgroundColor: '#2d1b1b',
              border: '1px solid #ff4d4f',
              borderRadius: 6,
            }}
          />
        </div>
      )}

      {/* Table */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%' }}>
          <AgGridReact
            theme={darkTheme}
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={fullTableData}
            loading={loading}
            autoSizeStrategy={{ type: 'fitGridWidth' }}
            domLayout={'autoHeight'}
            suppressMovableColumns={true}
            pagination={true}
            paginationPageSize={pageSize}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            onPaginationChanged={handlePaginationChanged}
            defaultColDef={{
              sortable: true,
              resizable: false,
              flex: 1,
              minWidth: 120,
              headerClass: 'center-header',
            }}
            overlayNoRowsTemplate={
              loading ? 'Loading exchange rate data...' : 'No data available'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateByDate;


