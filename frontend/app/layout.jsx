'use client';
import { AuthProvider } from '../context/AuthContext.jsx';
import { MarketProvider } from '../context/MarketContext.jsx';
import { AIProvider } from '../context/AIContext.jsx';
import { AppProvider } from '../context/AppContext.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import GlobalAIAssistant from '../components/ai/GlobalAIAssistant.jsx';
import { useScrollAnimation } from '../hooks/useScrollAnimation.js';
import '../styles/globals.css';

function SmoothScrollWrapper({ children }) {
  useScrollAnimation();
  return <>{children}</>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>MarketForge | Indian Stock Market Learning & Virtual Trading</title>
        <meta
          name="description"
          content="Next-generation virtual trading, financial education, and Indian stock market simulation platform."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <MarketProvider>
            <AIProvider>
              <AppProvider>
                <SmoothScrollWrapper>
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 80px)' }}>{children}</main>
                  <GlobalAIAssistant />
                </SmoothScrollWrapper>
              </AppProvider>
            </AIProvider>
          </MarketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
