import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Lab from "./pages/lab";
import Titration from "./pages/lab/titration";
import Distillation from "./pages/lab/distillation";
import SaltAnalysis from "./pages/lab/salt-analysis";
import NotFound from "./pages/NotFound";

import RoleSelection from "./RoleSelection";
import UserProtectedWrapper from "./UserProtectedWrapper";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import CreateExperiment from './pages/admin/CreateExperiment';
import PerformExperiment from './pages/student/PerformExperiment';
import DataInsights from "./pages/student/DataInsights";
import AdminInsights from "./pages/admin/AdminInsights";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Index />} />
          <Route path="/select-role" element={<RoleSelection />} />

          {/* Lab Routes */}
          {/* <Route path="/lab" element={<UserProtectedWrapper><Lab /></UserProtectedWrapper>} />
          <Route path="/lab/titration" element={<UserProtectedWrapper><Titration /></UserProtectedWrapper>} />
          <Route path="/lab/distillation" element={<UserProtectedWrapper><Distillation /></UserProtectedWrapper>} />
          <Route path="/lab/salt-analysis" element={<UserProtectedWrapper><SaltAnalysis /></UserProtectedWrapper>} /> */}

          {/* Dashboards */}
          <Route path="/admin/dashboard" element={<UserProtectedWrapper role="admin"><AdminDashboard /></UserProtectedWrapper>} />
          <Route path="/student/dashboard" element={<UserProtectedWrapper role="student"><StudentDashboard /></UserProtectedWrapper>} />
          <Route path="/dashboard/insights/:runId" element={<DataInsights />} />
          
          <Route path="/admin/create-experiment" element={<UserProtectedWrapper role="admin"><CreateExperiment /></UserProtectedWrapper>}/>
          <Route path="/experiment/:id" element={<UserProtectedWrapper><PerformExperiment /></UserProtectedWrapper>} />
          <Route path="/admin/insights/:experimentId" element={<UserProtectedWrapper role="admin"><AdminInsights /></UserProtectedWrapper>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
