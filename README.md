# FinBoard - Financial Dashboard

A modern, responsive financial dashboard built with Next.js that allows users to create custom widgets for monitoring real-time financial data from various APIs. Features a clean interface with drag-and-drop functionality and customizable layouts.

## 🚀 Features

### 📊 Core Capabilities
- **Custom Widget System**: Create, configure, and manage financial data widgets
- **Real-time Data**: Auto-refresh with configurable intervals (10-3600 seconds)
- **Responsive Grid Layout**: Drag-and-drop widgets with intelligent auto-positioning
- **API Integration**: Pre-configured endpoints for major financial data providers
- **Persistent Storage**: All configurations saved automatically in browser storage
- **Mobile Responsive**: Optimized layouts for desktop, tablet, and mobile devices

### 🔧 Widget Types
- **Card Widget**: Clean display of key financial metrics
- **Table Widget**: Tabular data with search functionality and pagination
- **Chart Widget**: Interactive line charts with white-themed styling

### 🌐 Supported APIs
- **Alpha Vantage**: Stock quotes, top gainers/losers, daily time series
- **Finnhub**: Real-time quotes, company profiles, candlestick data, market news
- **Custom Symbol Support**: Easily switch between different stock symbols (AAPL, GOOGL, MSFT, etc.)

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Frontend**: React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: Zustand 5.0.8 with persistence
- **Charts**: Recharts 2.15.4
- **Layout**: React Grid Layout 1.5.2
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner toast system

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JatinSri1909/finboard.git
   cd finboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Getting API Keys

- **Alpha Vantage**: Free at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
- **Finnhub**: Free tier at [finnhub.io](https://finnhub.io/register)

## 📖 Usage Guide

### Creating Your First Widget

1. **Click "Add Widget"** button in the dashboard header
2. **Select API preset** from the dropdown menu:
   - Choose from 7 pre-configured API endpoints
   - Widget name auto-populates based on selection
3. **Customize stock symbol** (for stock-related APIs):
   - Default: AAPL (Apple)
   - Supports: GOOGL, MSFT, TSLA, AMZN, etc.
4. **Configure settings**:
   - Display Mode: Card, Table, or Chart
   - Refresh Interval: 10-3600 seconds
5. **Test API connection** before saving
6. **Click "Add Widget"** to create

### Available API Presets

#### Alpha Vantage APIs
- **Stock Quote**: Real-time stock price data
- **Top Gainers**: Market's top performing stocks
- **Daily Chart**: Historical price data for charting

#### Finnhub APIs  
- **Stock Quote**: Current stock price and daily stats
- **Company Profile**: Business information and metrics
- **Stock Candles**: OHLC candlestick data
- **Market News**: Latest financial news

### Widget Management

- **Drag & Drop**: Reposition widgets by dragging
- **Auto-positioning**: New widgets automatically find available space
- **Refresh**: Manual refresh button on each widget
- **Configuration**: Click gear icon to modify settings
- **Delete**: Remove unwanted widgets

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── add-widget-modal.tsx
│   │   ├── dashboard-grid.tsx
│   │   ├── finance-chart.tsx
│   │   ├── finance-table.tsx
│   │   ├── widget-card.tsx
│   │   └── widget-config-modal.tsx
│   └── ui/                # shadcn/ui components
├── config/
│   └── environment.ts     # API endpoints configuration
├── hooks/                 # Custom React hooks
├── lib/
│   └── utils.ts          # Utility functions
└── stores/
    └── dashboard-store.ts # Zustand state management
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required API Keys
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
```

### Widget Configuration Options

#### Card Widgets
- Auto-displays key metrics from API response
- Compact layout for essential data points

#### Table Widgets  
- **Max Rows**: 5-100 rows per page
- **Search**: Toggle search functionality
- **Pagination**: Automatic for large datasets

#### Chart Widgets
- **Chart Type**: Line charts (area style with white theming)
- **Data Processing**: Handles various API response formats
- **Fallback Data**: Shows sample data if API fails

### Adding New API Endpoints

1. **Edit `src/config/environment.ts`**:
   ```typescript
   export const API_PRESETS = {
     'Your API Name': `https://api.example.com/endpoint?key=${process.env.NEXT_PUBLIC_YOUR_API_KEY}`,
   };
   ```

2. **Add environment variable** to `.env.local`

3. **Test integration** using the widget creation flow

## 🎨 Styling & Theming

### Current Theme
- **Dark theme** with professional financial styling
- **Color scheme**: Slate backgrounds with white text/borders
- **Chart styling**: White lines and elements for visibility
- **Responsive design**: Mobile-first approach

### Key Classes
```css
/* Backgrounds */
bg-background (slate-950)
bg-card (slate-800) 
bg-input (dark input fields)

/* Borders & Text */
border-widget-border (slate-700)
text-foreground (white)
text-muted-foreground (slate-400)
```

## 📊 Data Handling

### Supported Data Formats
- **Alpha Vantage**: Time Series, Global Quote objects
- **Finnhub**: OHLC arrays, single quote objects  
- **Generic**: Arrays of objects, nested JSON structures

### Error Handling
- **Network errors**: Graceful fallbacks with error messages
- **API failures**: Clear error display with retry options
- **CORS issues**: Guidance for custom API setup
- **Rate limiting**: Automatic retry logic for API limits

## 🔧 Development

### Available Scripts
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production with Turbopack  
npm run start      # Start production server
```

### Key Dependencies
- **Next.js 15.5.2**: App Router with Turbopack
- **React 19.1.0**: Latest React with concurrent features
- **Zustand 5.0.8**: Lightweight state management
- **React Grid Layout**: Drag-and-drop grid system
- **Recharts**: Charting library for financial data
- **Tailwind CSS 4**: Utility-first styling

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`  
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Test widget functionality with real API data
- Ensure responsive design on all screen sizes
- Document new features in README

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & FAQ

### Common Issues

**Q: Widgets not loading data?**
A: Check your API keys in `.env.local` and ensure they're valid.

**Q: CORS errors with custom APIs?**
A: Only pre-configured APIs are fully supported. Custom APIs need CORS headers.

**Q: Widget overlapping on mobile?**
A: The responsive grid automatically adjusts layouts. Try refreshing the page.

**Q: API rate limits reached?**
A: Increase refresh intervals or upgrade to paid API tiers.

### Get Help
- 📧 **Issues**: [GitHub Issues](https://github.com/JatinSri1909/finboard/issues)
- 📖 **Documentation**: This README and inline code comments
- 🐛 **Bug Reports**: Use GitHub Issues with detailed reproduction steps

## 🗺️ Roadmap

### Current Version (v0.1.0)
- ✅ Core widget system with 3 display types
- ✅ Alpha Vantage & Finnhub API integration  
- ✅ Responsive grid layout with drag-and-drop
- ✅ Persistent storage & auto-refresh

### Planned Features
- 🔄 **Real-time WebSocket connections** for live data
- 📊 **Advanced chart types** (candlestick, volume charts)
- 🎯 **Widget templates** for quick setup
- 📱 **Mobile app version** using React Native
- 🔗 **More API integrations** (Yahoo Finance, IEX Cloud)
- 💾 **Export/import** dashboard configurations
- 👥 **Multi-user dashboards** with sharing capabilities

---

**Built with ❤️ by [Jatin Sri](https://github.com/JatinSri1909)**

⭐ Star this repo if you find it useful!