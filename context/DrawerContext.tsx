import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DrawerContextType {
  isAddDrawerOpen: boolean;
  openAddDrawer: () => void;
  closeAddDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const openAddDrawer = () => setIsAddDrawerOpen(true);
  const closeAddDrawer = () => setIsAddDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ isAddDrawerOpen, openAddDrawer, closeAddDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
