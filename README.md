# 📊 Insight Intelligence Dashboard

> A comprehensive React-based web application providing real-time social media sentiment analysis for Nigerian politicians across multiple platforms.

## 🎯 Overview

Insight Intelligence Dashboard is a powerful civic technology platform that aggregates public social media data, applies advanced sentiment analysis, and presents actionable insights through interactive visualizations. The platform is specifically optimized for the Nigerian political context, helping citizens, journalists, researchers, and civil society organizations make data-driven decisions.

### 🌟 Key Features

- **🔍 Real-Time Sentiment Analysis**: Track public opinion on Nigerian politicians across social media platforms
- **📈 Interactive Visualizations**: Dynamic charts and graphs powered by Recharts for trend analysis
- **🎯 Multi-Platform Data**: Aggregates data from Twitter, Facebook, Instagram, YouTube, and news sources
- **👥 Demographic Insights**: Sentiment breakdown by age, gender, and geographic location
- **🔄 Live Updates**: Real-time data processing with historical trend analysis
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔎 Advanced Search**: Fuzzy search capabilities for politicians and political parties
- **📊 Comparative Analysis**: Side-by-side comparison of politicians and parties
- **🚨 Trending Detection**: Identify politicians gaining or losing public attention

### 🎯 Target Users

- **Informed Citizens** (60%): Make informed voting decisions based on public sentiment
- **Journalists & Media** (25%): Access data-driven insights for political reporting
- **Researchers & Analysts** (10%): Analyze political discourse patterns and trends
- **Civil Society Organizations** (5%): Monitor political accountability and engagement

## 🛠️ Technical Stack

### Frontend
- **⚛️ React 19.1.0** - Modern UI library with latest features
- **📘 TypeScript** - Type-safe development with enhanced developer experience
- **⚡ Vite** - Fast build tool and development server
- **🎨 UnoCSS** - Atomic CSS framework for rapid styling
- **🧭 React Router DOM** - Client-side routing and navigation

### State Management & Data
- **🐻 Zustand** - Lightweight state management solution
- **🔄 TanStack Query** - Powerful data fetching and caching
- **📡 Axios** - HTTP client for API communication

### UI Components & Visualization
- **📊 Recharts** - Composable charting library for data visualization
- **🎯 Heroicons** - Beautiful hand-crafted SVG icons
- **✨ Lucide React** - Customizable icon library
- **🎨 Tailwind Merge** - Utility for merging Tailwind CSS classes
- **🔧 clsx** - Conditional className utility

### Utilities & Tools
- **🔍 Fuse.js** - Fuzzy search functionality
- **📅 date-fns** - Modern date utility library
- **🧪 Playwright** - End-to-end testing framework
- **📏 ESLint** - Code linting and quality assurance

### Development Tools
- **📦 npm/yarn** - Package management
- **🔧 TypeScript ESLint** - TypeScript-specific linting rules
- **🚀 Vercel** - Deployment and hosting platform

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JonathanJude/insights_project.git
   cd insights_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 📁 Project Structure

```
insights_project/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── charts/         # Data visualization components
│   │   ├── filters/        # Filter and search components
│   │   ├── layout/         # Layout and navigation components
│   │   └── ui/             # Basic UI components
│   ├── pages/              # Application pages/routes
│   │   ├── dashboard/      # Main dashboard page
│   │   ├── politician/     # Individual politician pages
│   │   ├── party/          # Political party pages
│   │   └── search/         # Search results pages
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── mock/               # Mock data for development
│   └── lib/                # External library configurations
├── doc/                    # Project documentation
│   ├── research.md         # Technical research and APIs
│   ├── prd.md             # Product Requirements Document
│   ├── cost_analysis.md   # Operational cost analysis
│   └── scraping.md        # Data scraping strategies
└── public/                 # Static assets
```

## 📚 Documentation

Comprehensive documentation is available in the `/doc` folder:

- **[📋 Product Requirements Document](./doc/prd.md)** - Complete product specifications and roadmap
- **[🔬 Technical Research](./doc/research.md)** - Social media APIs and sentiment analysis tools
- **[💰 Cost Analysis](./doc/cost_analysis.md)** - Operational expenses and budget planning
- **[🕷️ Data Scraping Guide](./doc/scraping.md)** - Comprehensive social media data collection strategies

## 🌍 Nigerian Political Context

This platform is specifically designed for the Nigerian political landscape, featuring:

- **Major Political Parties**: APC, PDP, Labour Party, NNPP, and others
- **Key Politicians**: Presidential candidates, governors, senators, and representatives
- **Cultural Sensitivity**: Understanding of Nigerian political discourse and social media behavior
- **Legal Compliance**: Adherence to Nigeria Data Protection Regulation (NDPR) and Cybercrimes Act

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **API Documentation**: [Coming Soon]
- **GitHub Repository**: https://github.com/JonathanJude/insights_project

---

*Built with ❤️ for Nigerian democracy and civic engagement*
