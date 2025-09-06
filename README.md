# Finance Dashboard

A customizable finance dashboard where users can build their own real-time finance monitoring dashboard by connecting to various financial APIs and displaying real-time data through customizable widgets.

## Features

### 🎯 Core Features
- **Widget Management System**: Add, remove, and configure custom widgets
- **Multiple Display Modes**: Card, Table, and Chart views
- **Real-time Data**: Auto-refresh with configurable intervals
- **API Integration**: Connect to any financial API with dynamic field mapping
- **Data Persistence**: All configurations saved in browser storage
- **Responsive Design**: Works on desktop and mobile devices

### 🔧 Widget Types
- **Card Widget**: Display key metrics in a clean card format
- **Table Widget**: Show tabular data with search and sorting
- **Chart Widget**: Visualize data with interactive line charts

### 🌐 API Support
- **Alpha Vantage**: Stock market data and time series
- **Finnhub**: Real-time stock quotes and company profiles
- **Indian APIs**: BSE India market data
- **Custom APIs**: Connect to any REST API endpoint

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install missing Radix UI components**
   ```bash
   npm install @radix-ui/react-checkbox
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating Your First Widget

1. **Click "Add Widget"** in the top-right corner
2. **Enter widget details**:
   - Widget Name: e.g., "Bitcoin Price"
   - API URL: e.g., `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
   - Refresh Interval: How often to update (in seconds)
3. **Test the API** by clicking the "Test" button
4. **Select fields** to display from the API response
5. **Choose display mode**: Card, Table, or Chart
6. **Click "Add Widget"** to create your widget

### Supported API Examples

#### Coinbase API (Cryptocurrency)
```
URL: https://api.coinbase.com/v2/exchange-rates?currency=BTC
Fields: data.currency, data.rates.USD
```

#### Alpha Vantage API (Stocks)
```
URL: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY
Fields: Global Quote.01. symbol, Global Quote.05. price
```

#### Finnhub API (Real-time Quotes)
```
URL: https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY
Fields: c (current price), h (high), l (low), o (open)
```

#### Free APIs (No Key Required)
```
URL: https://api.coinbase.com/v2/exchange-rates?currency=USD
URL: https://api.exchangerate-api.com/v4/latest/USD
URL: https://api.github.com/repos/microsoft/vscode
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components
│   ├── shared/            # Shared components
│   ├── ui/                # UI components (shadcn/ui)
│   └── widgets/           # Widget components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api-client/        # API client implementations
│   ├── data-mapper.ts     # Data mapping utilities
│   └── storage.ts         # Browser storage utilities
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## API Integration

### Adding New API Clients

1. Create a new client class in `src/lib/api-client/`
2. Implement the required methods:
   - `testConnection()`: Test API connectivity
   - `makeRequest()`: Handle HTTP requests
   - `extractFields()`: Parse API response fields

### Data Mapping

The `DataMapper` class handles:
- Extracting nested values using dot notation
- Formatting values (currency, percentage, dates)
- Filtering and searching fields
- Type detection and validation

## Customization

### Adding New Widget Types

1. Create a new widget component in `src/components/widgets/`
2. Add the widget type to `WidgetType` in `src/types/widget.ts`
3. Update the `WidgetContainer` to handle the new type
4. Add display mode option in the configuration modal

### Styling

The app uses Tailwind CSS with a dark theme. Key color variables:
- Background: `slate-950`
- Cards: `slate-800`
- Borders: `slate-700`
- Text: `white` / `slate-400`

## Data Persistence

All widget configurations are automatically saved to browser localStorage with the prefix `finboard_`. This includes:
- Widget configurations
- Selected fields
- Display preferences
- API URLs and settings

## Error Handling

The app includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Invalid API responses
- CORS errors
- Authentication failures

## Performance

- **Lazy Loading**: Components are loaded on demand
- **Data Caching**: API responses are cached to reduce requests
- **Optimized Re-renders**: Zustand ensures minimal re-renders
- **Responsive Images**: Optimized for different screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions:
- Check the FAQ section in the original requirements
- Review the API documentation for your chosen data source
- Ensure your API endpoints support CORS for browser requests

## Roadmap

- [ ] Drag-and-drop widget reordering
- [ ] Widget templates and presets
- [ ] Export/import dashboard configurations
- [ ] Real-time WebSocket connections
- [ ] Advanced chart types (candlestick, area charts)
- [ ] Widget collaboration and sharing
- [ ] Mobile app version