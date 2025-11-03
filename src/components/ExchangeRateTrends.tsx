import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Alert } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import dayjs, { Dayjs } from 'dayjs';
import UnifiedTableFilter from './UnifiedTableFilter';
import { useTimeSeriesRates } from '../utils';
import type { TimeSeriesResponse } from '../utils/frankfurterApi';
import {
  URL_KEYS,
  getStringParam,
  getDateParam,
  getNumberParam,
  updateURLParams,
  formatDateForURL,
} from '../utils/urlParams';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create dark theme using Theming API with transparent background
const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({ backgroundColor: 'transparent' });

interface TrendTableDataType {
  date: string;
  baseCurrencyValue: number; // Base currency value, fixed to 1
  targetCurrencyRate: number; // Target currency rate
  change: number; // Difference from previous day
  changePercent: number; // Difference percentage
}

// Process time series data and calculate changes
const processTimeSeriesData = (
  timeSeriesData: TimeSeriesResponse | null,
  targetCurrency: string
): TrendTableDataType[] => {
  // If no rates, return empty
  if (!timeSeriesData?.rates) return [];

  const dates = Object.keys(timeSeriesData.rates).sort();
  const data: TrendTableDataType[] = [];
  let previousRate: number | null = null;

  dates.forEach((date) => {
    const rateData = timeSeriesData.rates[date];
    const currentRate = rateData[targetCurrency];

    if (currentRate) {
      let change = 0;
      let changePercent = 0;

      if (previousRate !== null) {
        change = currentRate - previousRate;
        changePercent = (change / previousRate) * 100;
      }

      data.push({
        date,
        baseCurrencyValue: 1, // Base currency value, fixed to 1
        targetCurrencyRate: parseFloat(currentRate.toFixed(4)),
        change: parseFloat(change.toFixed(4)),
        changePercent: parseFloat(changePercent.toFixed(2)),
      });

      previousRate = currentRate;
    }
  });

  return data.reverse(); // Descending
};

const ExchangeRateTrends: React.FC = () => {
  // Initialize from URL params
  const [baseCurrency, setBaseCurrency] = useState(
    getStringParam(URL_KEYS.TREND_BASE, 'USD')
  );
  const [targetCurrency, setTargetCurrency] = useState(
    getStringParam(URL_KEYS.TREND_TARGET, 'EUR')
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.TREND_START, dayjs().subtract(30, 'day'))
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.TREND_END, dayjs())
  );
  const [pageSize, setPageSize] = useState(
    getNumberParam(URL_KEYS.TREND_PAGESIZE, 20)
  );

  // Update URL when state changes (only if current table is trend)
  useEffect(() => {
    const currentTable = getStringParam(URL_KEYS.TABLE, 'table2');
    if (currentTable === 'table2') {
      updateURLParams({
        [URL_KEYS.TREND_BASE]: baseCurrency,
        [URL_KEYS.TREND_TARGET]: targetCurrency,
        [URL_KEYS.TREND_START]: formatDateForURL(startDate),
        [URL_KEYS.TREND_END]: formatDateForURL(endDate),
        [URL_KEYS.TREND_PAGESIZE]: pageSize.toString(),
      });
    }
  }, [baseCurrency, targetCurrency, startDate, endDate, pageSize]);

  // Get time series data
  const { data: timeSeriesData, loading, error } = useTimeSeriesRates({
    base: baseCurrency,
    symbols: [targetCurrency],
    start_date: startDate?.format('YYYY-MM-DD') || '',
    end_date: endDate?.format('YYYY-MM-DD') || '',
  });

  const handleSwap = () => {
    const temp = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const gridRef = useRef<AgGridReact>(null);

  // Table column configuration
  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      pinned: 'left',
      sortable: true,
      sort: 'desc' as const,
      comparator: (a: string, b: string) => {
        return dayjs(a).unix() - dayjs(b).unix();
      },
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'baseCurrencyValue',
      headerName: baseCurrency,
      width: 150,
      pinned: 'left',
      cellRenderer: () => '1',
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'targetCurrencyRate',
      headerName: targetCurrency,
      width: 150,
      valueFormatter: (params: ValueFormatterParams) => {
        return (params.value as number)?.toFixed(4) || '-';
      },
      sortable: true,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'change',
      headerName: 'Change',
      width: 150,
      cellRenderer: (params: { value: number }) => {
        if (params.value == null) return '-';
        const value = params.value;
        const color = value >= 0 ? '#52c41a' : '#ff4d4f'; // green rise red fall
        const text = (value >= 0 ? '+' : '') + value.toFixed(4);
        return React.createElement('span', { style: { color } }, text);
      },
      sortable: true,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'changePercent',
      headerName: 'Change %',
      width: 150,
      cellRenderer: (params: { value: number }) => {
        if (params.value == null) return '-';
        const value = params.value;
        const color = value >= 0 ? '#52c41a' : '#ff4d4f'; // green rise red fall
        const text = (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
        return React.createElement('span', { style: { color } }, text);
      },
      sortable: true,
      cellStyle: { textAlign: 'center' },
    },
  ], [baseCurrency, targetCurrency]);

  // Generate full table data
  const fullTableData = useMemo(() => {
    if (!timeSeriesData) return [];
    return processTimeSeriesData(timeSeriesData, targetCurrency);
  }, [timeSeriesData, targetCurrency]);

  // Handle pagination change
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
        className="tech-table-title"
        style={{
          flexShrink: 0,
          height: 40,
          margin: '0 0 16px 0',
          lineHeight: '40px',
        }}
      >
        Exchange Rate Trends
      </h3>

      {/* Filter */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <UnifiedTableFilter
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          onBaseCurrencyChange={setBaseCurrency}
          onTargetCurrencyChange={(c) => {
            // Ensure target currency is single select
            if (typeof c === 'string') {
              setTargetCurrency(c);
            } else if (Array.isArray(c) && c.length > 0) {
              setTargetCurrency(c[0]);
            }
          }}
          onSwap={handleSwap}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          allowMultipleTargets={false}
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
        <div style={{ width: '100%', minHeight: 300 }}>
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
              headerClass: 'center-header',
              flex: 1,
              minWidth: 120,
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

export default ExchangeRateTrends;
