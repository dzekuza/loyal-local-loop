
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import MobileNavigation from "./components/layout/MobileNavigation";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessScanPage from "./pages/business/BusinessScanPage";
import BusinessProfilePage from "./pages/business/BusinessProfilePage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import BusinessDirectory from "./pages/customer/BusinessDirectory";
import BusinessDetailPage from "./pages/customer/BusinessDetailPage";
import ScanQRCodePage from "./pages/customer/ScanQRCodePage";
import WalletPage from "./pages/customer/WalletPage";
import DiscoverPage from "./pages/customer/DiscoverPage";
import MainScreen from "./pages/customer/MainScreen";
import MyCardsPage from "./pages/customer/MyCardsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import './i18n';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-white">
              <Header />
              <div className="pb-20 md:pb-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Business-only routes */}
                  <Route path="/dashboard" element={
                    <RoleBasedRoute allowedRoles={['business']} redirectTo="/main">
                      <BusinessDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="/business/scan" element={
                    <RoleBasedRoute allowedRoles={['business']} redirectTo="/main">
                      <BusinessScanPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/business-profile" element={
                    <RoleBasedRoute allowedRoles={['business']} redirectTo="/customer-profile">
                      <BusinessProfilePage />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Customer-only routes */}
                  <Route path="/main" element={
                    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/dashboard">
                      <MainScreen />
                    </RoleBasedRoute>
                  } />
                  <Route path="/customer-profile" element={
                    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/business-profile">
                      <CustomerProfilePage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/my-cards" element={
                    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/dashboard">
                      <MyCardsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/wallet" element={
                    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/dashboard">
                      <WalletPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/scan" element={
                    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/dashboard">
                      <ScanQRCodePage />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Public routes accessible to both roles */}
                  <Route path="/businesses" element={<BusinessDirectory />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/business/:id" element={<BusinessDetailPage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <MobileNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
