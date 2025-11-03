import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { Plugin } from "chart.js";
import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import CurrencyFilter from "./CurrencyFilter";
import { useTimeSeriesRates } from "../utils";
import {
  URL_KEYS,
  getStringParam,
  getArrayParam,
  getDateParam,
  updateURLParams,
  formatDateForURL,
  formatArrayForURL,
} from "../utils/urlParams";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// vertical line on hover
const verticalHoverLine: Plugin<'line'> = {
  id: 'verticalHoverLine',
  afterEvent(chart) {
    chart.draw();
  },
  beforeDatasetsDraw(chart) {
    const active = (chart as unknown as { getActiveElements: () => Array<{ element: { x: number } }> }).getActiveElements();
    if (!active || active.length === 0) return;
    const x = active[0].element.x;
    const { ctx, chartArea: { top, bottom } } = chart;
    ctx.save();
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  }
};

dayjs.extend(weekOfYear);

const LineChart: React.FC = () => {
  // Initialize from URL params
  const [baseCurrency, setBaseCurrency] = useState(
    getStringParam(URL_KEYS.CHART_BASE, "USD")
  );
  const [targetCurrency, setTargetCurrency] = useState<string[]>(
    getArrayParam(URL_KEYS.CHART_TARGET, ["EUR"])
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.CHART_START, dayjs().subtract(30, "day"))
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    getDateParam(URL_KEYS.CHART_END, dayjs())
  );
  const [timePeriod, setTimePeriod] = useState(
    getStringParam(URL_KEYS.CHART_PERIOD, "day")
  );

  // Update URL when state changes
  useEffect(() => {
    updateURLParams({
      [URL_KEYS.CHART_BASE]: baseCurrency,
      [URL_KEYS.CHART_TARGET]: formatArrayForURL(targetCurrency),
      [URL_KEYS.CHART_START]: formatDateForURL(startDate),
      [URL_KEYS.CHART_END]: formatDateForURL(endDate),
      [URL_KEYS.CHART_PERIOD]: timePeriod,
    });
  }, [baseCurrency, targetCurrency, startDate, endDate, timePeriod]);

  const { data: timeSeriesData, loading, error, refetch } = useTimeSeriesRates({
    base: baseCurrency,
    symbols: targetCurrency,
    start_date: startDate?.format("YYYY-MM-DD") || dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    end_date: endDate?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
  });

  const filterDatesByPeriod = (dates: string[], period: string) => {
    if (period === "day") return dates;

    const filtered: string[] = [];
    if (period === "week") {
      dates.forEach((date) => {
        const dayOfWeek = dayjs(date).day();
        if (dayOfWeek === 1) filtered.push(date);
      });
      if (filtered.length === 0) {
        let currentWeek = -1;
        dates.forEach((date) => {
          const w = dayjs(date).week();
          if (w !== currentWeek) {
            currentWeek = w;
            filtered.push(date);
          }
        });
      }
    } else if (period === "month") {
      dates.forEach((date) => {
        if (dayjs(date).date() === 1) filtered.push(date);
      });
      if (filtered.length === 0) {
        let currentMonth = -1;
        dates.forEach((date) => {
          const m = dayjs(date).month();
          if (m !== currentMonth) {
            currentMonth = m;
            filtered.push(date);
          }
        });
      }
    }
    return filtered;
  };

  const chartData = useMemo(() => {
    if (!timeSeriesData || !timeSeriesData.rates) {
      return { dates: [], series: [] as Array<{ name: string; data: Array<number | null> }> };
    }
    const allDates = Object.keys(timeSeriesData.rates).sort();
    const filteredDates = filterDatesByPeriod(allDates, timePeriod);
    const series = targetCurrency.map((currency) => {
      const data = filteredDates.map((date) => timeSeriesData.rates[date]?.[currency] || null);
      return { name: `${baseCurrency}/${currency}`, data };
    });
    return { dates: filteredDates, series };
  }, [timeSeriesData, baseCurrency, targetCurrency, timePeriod]);

  const chartConfig = useMemo(() => {
    const colors = ["#1f6feb", "#09da33", "#a8ae05", "#7c3aed", "#dc2626", "#ea580c"];
    return {
      labels: chartData.dates.map((d) => {
        if (timePeriod === "day") return dayjs(d).format("MMM DD");
        if (timePeriod === "week") return dayjs(d).format("MMM DD") + " (Week)";
        if (timePeriod === "month") return dayjs(d).format("MMM YYYY");
        return dayjs(d).format("MMM DD");
      }),
      datasets: chartData.series.map((s, i) => ({
        label: s.name,
        data: s.data,
        borderColor: colors[i % colors.length],
        backgroundColor: `${colors[i % colors.length]}33`,
        tension: 0,
        fill: true,
      })),
    };
  }, [chartData, timePeriod]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      title: { display: true, text: "Exchange Rate Trends" },
      legend: { display: true },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { display: true },
      y: { display: true, title: { display: true, text: "Exchange Rate" } },
    },
  }), []);

  const handleSwap = () => {
    if (Array.isArray(targetCurrency) && targetCurrency.length === 1) {
      const temp = baseCurrency;
      setBaseCurrency(targetCurrency[0]);
      setTargetCurrency([temp]);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
      <CurrencyFilter
        baseCurrency={baseCurrency}
        targetCurrency={targetCurrency}
        onBaseCurrencyChange={setBaseCurrency}
        onTargetCurrencyChange={(c: string | string[]) => setTargetCurrency(Array.isArray(c) ? c : [c])}
        onSwap={handleSwap}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading exchange rate data...</div>
        )}
        {error && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#f85149" }}>
            Failed to load data: {error}
            <button onClick={refetch} style={{ marginLeft: 12 }}>Retry</button>
          </div>
        )}
        <Line data={chartConfig} options={chartOptions} plugins={[verticalHoverLine]} />
      </div>
    </div>
  );
};

export default LineChart;


