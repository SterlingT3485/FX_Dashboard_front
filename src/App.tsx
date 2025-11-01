import { useState } from "react";
import type { Dayjs } from "dayjs";
import CurrencyFilter from "./components/CurrencyFilter";
import "./App.css";

function App() {
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>(["EUR"]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

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
      <div className="content-area">
        <CurrencyFilter
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrencies}
          onBaseCurrencyChange={setBaseCurrency}
          onTargetCurrencyChange={setTargetCurrencies}
          onSwap={handleSwap}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Filter INFO</h3>
          <div>Base: {baseCurrency}</div>
          <div>Targets: {targetCurrencies.join(", ") || "(none)"}</div>
          <div>
            Date Range: {startDate ? startDate.format("YYYY-MM-DD") : "(none)"} - {endDate ? endDate.format("YYYY-MM-DD") : "(none)"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
