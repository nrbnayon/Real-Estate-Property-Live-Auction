# AZ Deal Hub - AI-Powered Real Estate Acquisition Platform

![AZ Deal Hub](https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80)

## 🏠 Overview

AZ Deal Hub is a comprehensive AI-powered real estate acquisition platform focused on distressed property opportunities in Arizona. The platform combines Zillow-quality visual interfaces with advanced AI analysis, live auction capabilities, and automated property evaluation to streamline the real estate investment process.

## ✨ Key Features

### 🤖 AI-Powered Analysis
- **Groq AI Integration**: Utilizes Llama-3.3-70B-Versatile and Llama-3.1-8B-Instant models
- **Automated Property Valuation**: AI-driven ARV calculations and market analysis
- **Smart Bid Recommendations**: AI suggests optimal bidding strategies
- **Risk Assessment**: Comprehensive investment risk evaluation
- **Market Trend Analysis**: Real-time market condition insights

### 🔥 Live Auction System
- **Real-Time Bidding**: WebSocket-powered live auction interface
- **AI Bid Assistant**: Get AI recommendations during live auctions
- **Auction Timer**: Real-time countdown with progress indicators
- **Multi-Bidder Support**: Track active bidders and competition
- **Instant Notifications**: Real-time bid updates and alerts

### 🏘️ Property Management
- **Comprehensive Listings**: Detailed property information with high-quality images
- **Advanced Filtering**: Search by price, location, property type, and more
- **Interactive Maps**: Property locations with neighborhood data
- **Comparable Sales**: AI-powered comp analysis
- **Investment Metrics**: ROI calculations and profit projections

### 👨‍💼 Admin Dashboard
- **Property Management**: Complete CRUD operations for properties
- **Bid Approval System**: Review and approve/reject bids
- **SMS Integration**: Twilio-powered notifications and alerts
- **Analytics Dashboard**: Performance metrics and insights
- **User Management**: Track bidders and user activity

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icons

### Backend Integration
- **FastAPI**: Python backend (existing)
- **Supabase**: PostgreSQL database
- **Twilio**: SMS/MMS messaging
- **WebSocket**: Real-time auction updates

### AI & Analytics
- **Groq AI**: Llama models for property analysis
- **AI SDK**: Vercel AI SDK for model integration
- **Real-time Analysis**: Live property evaluation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key
- Supabase account
- Twilio account (optional)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/your-username/az-deal-hub.git
cd az-deal-hub
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Environment Setup**
Create a `.env.local` file in the root directory:

\`\`\`env
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WebSocket Configuration (Optional)
NEXT_PUBLIC_WS_URL=ws://localhost:8080/auction


# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
\`\`\`

4. **Run the development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

### 🏠 Homepage (`/`)
- Hero section with compelling messaging
- Property search functionality
- Live statistics dashboard
- Featured properties grid

### 🏘️ Properties (`/properties`)
- Complete property listings
- Advanced filtering system
- Sort by price, date, location
- Property comparison tools

### 🏡 Property Details (`/property/[slug]`)
- Detailed property information
- High-resolution image galleries
- AI-powered market analysis
- Comparable sales data
- Interactive neighborhood maps

### 🔥 Live Auction (`/auction/[propertyId]`)
- Real-time bidding interface
- AI bid recommendations
- Live auction timer
- Bidder competition tracking
- Auction rules and information

### 👨‍💼 Admin Dashboard (`/admin`)
- Property management interface
- Bid approval system
- SMS message logs
- Performance analytics
- User activity tracking

## 🤖 AI Integration

### Groq AI Models
- **Primary**: `llama-3.3-70b-versatile` - Advanced reasoning and analysis
- **Fallback**: `llama-3.1-8b-instant` - Fast responses for real-time features

### AI Capabilities
- **Property Analysis**: Comprehensive investment evaluation
- **Market Trends**: Real-time market condition analysis
- **Bid Recommendations**: Smart bidding strategies
- **Risk Assessment**: Investment risk evaluation
- **Repair Estimates**: AI-powered renovation cost predictions

## 🔄 Real-Time Features

### WebSocket Integration
- Live auction updates
- Real-time bid notifications
- Connection status monitoring
- Automatic reconnection handling

### Live Auction Flow
1. **Connection**: Establish WebSocket connection
2. **Bidding**: Place bids with AI assistance
3. **Updates**: Receive real-time auction updates
4. **Notifications**: Get instant bid confirmations

## 🎨 UI/UX Design

### Design Principles
- **Zillow-Inspired**: Professional real estate interface
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized images and lazy loading

### Color Scheme
- **Primary**: Blue tones for trust and professionalism
- **Success**: Green for positive metrics and profits
- **Warning**: Orange/Yellow for auction alerts
- **Danger**: Red for high-risk indicators

## 📊 Performance & Optimization

### Image Optimization
- Next.js Image component with automatic optimization
- Responsive images with multiple sizes
- Lazy loading for better performance
- WebP format support

### Code Splitting
- Automatic code splitting with Next.js
- Dynamic imports for heavy components
- Optimized bundle sizes

## 🔒 Security Features

### Data Protection
- Environment variable protection
- API key security
- Input validation and sanitization
- CORS configuration

### Auction Security
- Bid validation
- User authentication (ready for implementation)
- Rate limiting protection
- WebSocket security

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
\`\`\`bash
npm run build
npm run start
\`\`\`

## 🔧 Configuration

### Groq AI Setup
1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate API key
3. Add to environment variables
4. Configure model preferences in `lib/groq.ts`

### WebSocket Configuration
- Update `NEXT_PUBLIC_WS_URL` for your WebSocket server
- Implement backend WebSocket handlers
- Configure auction room management

## 📈 Analytics & Monitoring

### Built-in Analytics
- Property view tracking
- Bid activity monitoring
- User engagement metrics
- Performance dashboards

### Integration Ready
- Google Analytics
- Mixpanel
- Custom analytics solutions

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits

## 📞 Support & Contact

### Documentation
- [API Documentation](https://azdealhub-api.onrender.com/docs)
- [Component Library](https://ui.shadcn.com)
- [Groq AI Docs](https://console.groq.com/docs)

### Issues & Bugs
- GitHub Issues for bug reports
- Feature requests welcome
- Community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq AI** for powerful language models
- **Vercel** for hosting and AI SDK
- **shadcn/ui** for beautiful components
- **Unsplash** for high-quality property images
- **Arizona Real Estate Community** for market insights

---

**Built with ❤️ for Arizona Real Estate Investors**

*Transform your property acquisition process with AI-powered insights and live auction capabilities.*
