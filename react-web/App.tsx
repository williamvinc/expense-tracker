import React from 'react';
import { MemoryRouter, Routes, Route, useLocation, Location } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { SendMoney } from './pages/SendMoney';
import { Profile } from './pages/Profile';
import { Limits } from './pages/Limits';
import { Settings } from './pages/Settings';
import { Security } from './pages/Security';
import { AddTransaction } from './pages/AddTransaction';
import { TransactionDetails } from './pages/TransactionDetails';
import { TopUp } from './pages/TopUp';
import { PersonalInfo } from './pages/PersonalInfo';
import { Stats } from './pages/Stats';
import { HelpSupport } from './pages/HelpSupport';
import { Onboarding } from './pages/Onboarding'; // Import Onboarding
import { TransactionProvider } from './context/TransactionContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetProvider } from './context/BudgetContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { WalletProvider } from './context/WalletContext';
import { SecurityProvider } from './context/SecurityContext';
import { CurrencySelector } from './components/CurrencySelector';
import { LockScreen } from './components/LockScreen';

const AppContent: React.FC = () => {
    const location = useLocation();
    const { isOnboarded } = useUser(); // Get onboarding status
    
    // Check if we have a background location state (for modal overlays)
    const state = location.state as { backgroundLocation?: Location } | null;
    const backgroundLocation = state?.backgroundLocation;

    // Use background location if available, otherwise current location
    const elementLocation = backgroundLocation || location;
    
    // Logic for hiding bottom nav
    const isModalRoute = ['/add-transaction', '/limits', '/send', '/top-up', '/settings', '/personal-info', '/security', '/help-support'].includes(location.pathname) || 
                         location.pathname.startsWith('/transaction/');
    
    const showNav = !isModalRoute || !!backgroundLocation;

    // If not onboarded, show Onboarding screen inside Layout
    if (!isOnboarded) {
        return (
            <Layout>
                <Onboarding />
            </Layout>
        );
    }

    return (
        <Layout>
            <LockScreen />
            <CurrencySelector />
            
            {/* Main Routes Layer */}
            <Routes location={elementLocation}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/send" element={<SendMoney />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/limits" element={<Limits />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/personal-info" element={<PersonalInfo />} />
                <Route path="/security" element={<Security />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/help-support" element={<HelpSupport />} />

                {/* Direct access fallback routes */}
                <Route path="/add-transaction" element={<AddTransaction />} />
                <Route path="/top-up" element={<TopUp />} />
                <Route path="/transaction/:id" element={<TransactionDetails />} />
            </Routes>
            
            {showNav && <BottomNav />}

            {/* Modal Layer - Renders on top if background exists */}
            {backgroundLocation && (
                <Routes>
                    <Route path="/add-transaction" element={<AddTransaction />} />
                    <Route path="/top-up" element={<TopUp />} />
                    <Route path="/transaction/:id" element={<TransactionDetails />} />
                </Routes>
            )}
        </Layout>
    );
}

export default function App() {
  return (
    <ThemeProvider>
        <UserProvider>
            <CurrencyProvider>
                <WalletProvider>
                    <TransactionProvider>
                        <BudgetProvider>
                            <SecurityProvider>
                                <MemoryRouter>
                                    <AppContent />
                                </MemoryRouter>
                            </SecurityProvider>
                        </BudgetProvider>
                    </TransactionProvider>
                </WalletProvider>
            </CurrencyProvider>
        </UserProvider>
    </ThemeProvider>
  );
}