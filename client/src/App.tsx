import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import Login from "@/pages/login";
import ProductDetails from "@/pages/product-details";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";
import { EstimatesPage } from "@/pages/estimates";
import CollectionsPage from "@/pages/collections";
import { AuthProvider } from "./lib/auth";
import { CartProvider } from "./lib/cart";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/estimates" component={EstimatesPage} />
      <Route path="/collections/gold" component={() => <CollectionsPage material="GOLD" />} />
      <Route path="/collections/silver" component={() => <CollectionsPage material="SILVER" />} />
      <Route path="/collections/diamond" component={() => <CollectionsPage material="DIAMOND" />} />
      <Route path="/collections" component={() => <CollectionsPage />} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
