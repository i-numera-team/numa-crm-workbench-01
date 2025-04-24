
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Unauthorized from "./pages/Unauthorized";

// Layout
import Layout from "./components/layout/Layout";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Cart from "./pages/Cart";
import Quote from "./pages/Quote";
import Dossiers from "./pages/Dossiers";
import DossierDetail from "./pages/DossierDetail";
import Quotes from "./pages/Quotes";
import QuoteDetail from "./pages/QuoteDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Root redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Protected Routes - All Roles */}
              <Route element={<Layout allowedRoles={['client', 'agent', 'admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/quote" element={<Quote />} />
                <Route path="/dossiers" element={<Dossiers />} />
                <Route path="/dossiers/:id" element={<DossierDetail />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/quotes/:id" element={<QuoteDetail />} />
              </Route>
              
              {/* Protected Routes - Admin Only */}
              <Route element={<Layout allowedRoles={['admin']} />}>
                <Route path="/users" element={<div className="p-4">User Management Page</div>} />
                <Route path="/settings" element={<div className="p-4">Settings Page</div>} />
              </Route>
              
              {/* Catch-all for unknown routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
