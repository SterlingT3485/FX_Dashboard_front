import React, { useState, useMemo, useRef, useEffect } from "react";
import { Alert } from "antd";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeDark } from "ag-grid-community";
import dayjs, { Dayjs } from "dayjs";
import UnifiedTableFilter from "./UnifiedTableFilter";
import { useTimeSeriesRates, useCurrencies } from "../utils";

ModuleRegistry.registerModules([AllCommunityModule]);

const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({ backgroundColor: "transparent" });

interface DateTableDataType {
  date: string;
  baseCurrency: string;
  [key: string]: string | number;
}

const ExchangeRateByDate: React.FC = () => {
  // Local state only (no url params in this phase)
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [targetCurrency, setTargetCurrency] = useState<string[]>(["EUR"]);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [pageSize, setPageSize] = useState<number>(20);

  const { currencyList } = useCurrencies();

  const { data: timeSeriesData, loading, error, refetch } = useTimeSeriesRates({
    base: baseCurrency,
    symbols: targetCurrency,
    start_date: startDate?.format("YYYY-MM-DD") || dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    end_date: endDate?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
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

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.paginationGoToPage(0);
    }
  }, [baseCurrency, targetCurrency, startDate, endDate]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3 className="tech-table-title" style={{ flexShrink: 0, height: 40, margin: "0 0 16px 0", lineHeight: "40px" }}>
        Exchange Rate by Date
      </h3>
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <UnifiedTableFilter
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          onBaseCurrencyChange={setBaseCurrency}
          onTargetCurrencyChange={(c: string | string[]) => setTargetCurrency(Array.isArray(c) ? c : [c])}
          onSwap={handleSwap}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          allowMultipleTargets={true}
        />
      </div>

      {error && (
        <div style={{ flexShrink: 0, marginBottom: 16 }}>
          <Alert
            message="Failed to load exchange rate data"
            description={error}
            type="error"
            showIcon
            action={<button onClick={refetch} style={{ padding: "4px 8px", backgroundColor: "#1890ff", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Retry</button>}
            style={{ backgroundColor: "#2d1b1b", border: "1px solid #ff4d4f", borderRadius: 6 }}
          />
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        <div style={{ width: "100%" }}>
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
            defaultColDef={{ sortable: true, resizable: false, flex: 1, minWidth: 120, headerClass: 'center-header' }}
            overlayNoRowsTemplate={loading ? "Loading exchange rate data..." : "No data available"}
          />
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateByDate;


