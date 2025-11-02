import { useState } from "react";
import type { Dayjs } from "dayjs";
import CurrencyFilter from "./components/CurrencyFilter";
import LineChart from "./components/LineChart";
import ExchangeRateByDate from "./components/ExchangeRateByDate";
import { Segmented, Radio } from "antd";
import { LineChartOutlined, TableOutlined } from "@ant-design/icons";
import "./App.css";

type ViewType = "chart" | "table";
type TableType = "table1" | "table2";

function App() {
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>(["EUR"]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("chart");
  const [currentTable, setCurrentTable] = useState<TableType>("table1");

  const handleSwap = () => {
    if (targetCurrencies.length === 1) {
      const [onlyTarget] = targetCurrencies;
      setBaseCurrency(onlyTarget);
      setTargetCurrencies([baseCurrency]);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">FX Dashboard</h1>
      </header>
      <div className="tab-slider">
        <Segmented
          options={[
            { label: "Line Chart", value: "chart", icon: <LineChartOutlined /> },
            { label: "Table", value: "table", icon: <TableOutlined /> },
          ]}
          value={currentView}
          onChange={(value) => setCurrentView(value as ViewType)}
          size="large"
          style={{ margin: "16px" }}
        />
        {currentView === "table" && (
          <div className="table-switcher" style={{ margin: "0 16px 12px 16px" }}>
            <Radio.Group
              options={[
                { label: "Date Table", value: "table1" },
                { label: "Trend Table", value: "table2" },
              ]}
              onChange={(e) => setCurrentTable(e.target.value as TableType)}
              value={currentTable}
              optionType="button"
              buttonStyle="solid"
              size="large"
            />
          </div>
        )}
      </div>
      <div className="content-area">
        {currentView === "chart" ? (
          <LineChart />
        ) : (
          <>
            {currentTable === "table1" && <ExchangeRateByDate />}
          </>
        )}
        {currentView === "chart" && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Filter INFO</h3>
            <div>Base: {baseCurrency}</div>
            <div>Targets: {targetCurrencies.join(", ") || "(none)"}</div>
            <div>
              Date Range: {startDate ? startDate.format("YYYY-MM-DD") : "(none)"} - {endDate ? endDate.format("YYYY-MM-DD") : "(none)"}
            </div>
            <div>View: {currentView}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
