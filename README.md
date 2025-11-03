# FX Dashboard Frontend

A React.js frontend application for FX (Foreign Exchange) rate dashboard, providing real-time exchange rate queries, chart visualization, and table analysis.

## Features

- Exchange rate charts with daily/weekly/monthly views
- Data tables with date and trend views
- Multi-currency filtering and date range selection
- URL state synchronization for sharing and page refresh
- Modern dark theme UI based on Ant Design

## Requirements

- Yarn package manager
- Modern browser support (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd FX_Dashboard_front
```

### 2. Install dependencies

```bash
yarn install
```

## Configuration

### Development Environment

The API proxy configuration for development is in `vite.config.ts`:

```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8080",  // Backend API address
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### Production Environment

Production API proxy configuration is in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://fx-backend-demo-a3914b7d1725.herokuapp.com/api/:splat"
  status = 200
  force = true
```

## Getting Started

### Development Mode

Start the development server (runs on http://localhost:5173 by default):

```bash
yarn dev
```

The development server supports Hot Module Replacement (HMR).

### Build for Production

Build optimized production version:

```bash
yarn build
```

Build output will be in the `dist/` directory.

## Deployment

### Netlify Deployment

The project includes `netlify.toml` configuration for easy deployment:

1. **Via Netlify Dashboard**:

   - Login to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select repository and connect
   - Netlify will automatically detect `netlify.toml` configuration

2. **Via Netlify CLI**:
   ```bash
   yarn global add netlify-cli
   netlify deploy --prod
   ```

## Usage

### Basic Operations

1. **Chart View**:

   - Click "Line Chart" tab at the top
   - Select base currency and target currency(ies)
   - Select date range and time period (day/week/month)
   - Use swap button to exchange base and target currencies

2. **Table View**:

   - Click "Table" tab at the top
   - Choose "Date Table" or "Trend Table"
   - Use filters to select currencies and date range
   - Tables support pagination, sorting, and filtering

3. **URL Synchronization**:
   - All filter conditions are automatically synced to URL
   - Share URLs with others
   - Page refresh automatically restores all filter conditions

### Filter Options

- **Base Currency**: Select the base currency (e.g., USD)
- **Target Currency**: Select one or multiple target currencies (charts support multiple, trend table supports single only)
- **Date Range**: Select start and end dates
- **Time Period** (charts only): Choose day/week/month view

### Table Features

- **Date Table**: Shows exchange rates for all target currencies by date
- **Trend Table**: Shows trend for a single currency with change values and percentages

## Tech Stack

- Framework: React 19.1.1
- Language: TypeScript 5.9.3
- Build Tool: Vite 7.1.7
- UI Components: Ant Design 6.0.0-alpha.3
- Charts: Chart.js 4.5.1 + react-chartjs-2 5.3.1
- Tables: AG Grid 33.2.0
- Date Handling: Day.js 1.11.19
- HTTP Client: Axios 1.13.1

## Project Structure

```
FX_Dashboard_front/
├── src/
│   ├── components/          # React components
│   │   ├── CurrencyFilter.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── LineChart.tsx
│   │   ├── ExchangeRateByDate.tsx
│   │   ├── ExchangeRateTrends.tsx
│   │   └── UnifiedTableFilter.tsx
│   ├── utils/               # Utility functions
│   │   ├── frankfurterApi.ts
│   │   ├── frankfurterHooks.ts
│   │   ├── urlParams.ts
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Build output (generated)
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── netlify.toml             # Netlify deployment configuration
└── package.json             # Project dependencies
```

See LICENSE file for details.
