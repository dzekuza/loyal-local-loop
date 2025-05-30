
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessProfilePage from "./pages/business/BusinessProfilePage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import BusinessDirectory from "./pages/customer/BusinessDirectory";
import BusinessDetailPage from "./pages/customer/BusinessDetailPage";
import ScanQRCodePage from "./pages/customer/ScanQRCodePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<BusinessDashboard />} />
              <Route path="/business-profile" element={<BusinessProfilePage />} />
              <Route path="/customer-profile" element={<CustomerProfilePage />} />
              <Route path="/businesses" element={<BusinessDirectory />} />
              <Route path="/business/:id" element={<BusinessDetailPage />} />
              <Route path="/scan" element={<ScanQRCodePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
