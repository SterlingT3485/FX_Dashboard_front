import { useState, useEffect } from "react";
import { Segmented, Radio } from "antd";
import { LineChartOutlined, TableOutlined } from "@ant-design/icons";
import LineChart from "./components/LineChart";
import ExchangeRateByDate from "./components/ExchangeRateByDate";
import ExchangeRateTrends from "./components/ExchangeRateTrends";
import { URL_KEYS, getStringParam, updateURLParams } from "./utils/urlParams";
import "./App.css";

type ViewType = "chart" | "table";
type TableType = "table1" | "table2";

function App() {
  // Initialize from URL params
  const [currentView, setCurrentView] = useState<ViewType>(
    (getStringParam(URL_KEYS.VIEW, "chart") as ViewType) || "chart"
  );
  const [currentTable, setCurrentTable] = useState<TableType>(
    (getStringParam(URL_KEYS.TABLE, "table1") as TableType) || "table1"
  );

  // Update URL when view changes
  useEffect(() => {
    updateURLParams({
      [URL_KEYS.VIEW]: currentView,
    });
  }, [currentView]);

  // Update URL when table changes
  useEffect(() => {
    updateURLParams({
      [URL_KEYS.TABLE]: currentTable,
    });
  }, [currentTable]);

  const viewOptions = [
    {
      label: "Line Chart",
      value: "chart",
      icon: <LineChartOutlined />,
    },
    {
      label: "Table",
      value: "table",
      icon: <TableOutlined />,
    },
  ];

  const tableOptions = [
    { label: "Date Table", value: "table1" },
    { label: "Trend Table", value: "table2" },
  ];

  const renderContent = () => {
    if (currentView === "chart") {
      return (
        <LineChart />
      );
    } else {
      return (
        <>
          <div className="table-switcher">
            <div className="tech-radio-container">
              <Radio.Group
                options={tableOptions}
                onChange={(e) => {
                  const newTable = e.target.value as TableType;
                  setCurrentTable(newTable);
                  updateURLParams({ [URL_KEYS.TABLE]: newTable });
                }}
                value={currentTable}
                optionType="button"
                buttonStyle="solid"
                size="large"
                className="tech-radio-group"
              />
            </div>
          </div>
          {currentTable === "table1" && <ExchangeRateByDate />}
          {currentTable === "table2" && <ExchangeRateTrends />}
        </>
      );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">FX Dashboard</h1>
      </header>
      <div className="tab-slider">
        <Segmented
          options={viewOptions}
          value={currentView}
          onChange={(value) => {
            const newView = value as ViewType;
            setCurrentView(newView);
            updateURLParams({ [URL_KEYS.VIEW]: newView });
          }}
          size="large"
          style={{
            margin: "16px",
          }}
        />
      </div>
      <div className="content-area">{renderContent()}</div>
    </div>
  );
}

export default App;
