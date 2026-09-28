import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitCase from "./pages/SubmitCase";
import ReportSighting from "./pages/ReportSighting";
import Dashboard from "./pages/Dashboard";
import UploadFootage from "./pages/UploadFootage";
import AdminMatches from "./pages/AdminMatches";
import AdminFootage from "./pages/AdminFootage";
import AdminAIAnalysis from "./pages/AdminAIAnalysis";
import LegalHelp from "./pages/LegalHelp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit-case" element={<SubmitCase />} />
          <Route path="/report-sighting" element={<ReportSighting />} />
          <Route path="/upload-footage" element={<UploadFootage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/matches" element={<AdminMatches />} />
          <Route path="/admin/footage" element={<AdminFootage />} />
          <Route path="/admin/ai-analysis" element={<AdminAIAnalysis />} />
          <Route path="/legal-help" element={<LegalHelp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
