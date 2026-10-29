'use client';
import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
