import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, type ErrorInfo, type ReactNode } from "react";
import Index from "./pages/Index";
import Embed from "./pages/Embed";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";

const queryClient = new QueryClient();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Terjadi kesalahan
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Something went wrong. Please refresh the page.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Silakan refresh halaman untuk melanjutkan.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OfflineIndicator />
          <PWAUpdatePrompt />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/embed" element={<Embed />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
