import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ProjectDetail from "@/pages/project-detail";
import ProjectSettings from "@/pages/project-settings";
import TeamSecrets from "@/pages/team-secrets";
import Analytics from "@/pages/analytics";
import DocsPage from "@/pages/docs";
import TemplatesPage from "@/pages/templates";
import GuidesPage from "@/pages/guides";
import AICopilotPage from "@/pages/ai-copilot";
import PerformanceInsightsPage from "@/pages/performance-insights";
import OAuthDemoPage from "@/pages/oauth-demo";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/docs" component={DocsPage} />
          <Route path="/templates" component={TemplatesPage} />
          <Route path="/guides" component={GuidesPage} />
          <Route path="/ai-copilot" component={AICopilotPage} />
          <Route path="/performance" component={PerformanceInsightsPage} />
          <Route path="/oauth-demo" component={OAuthDemoPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/projects/:id/settings" component={ProjectSettings} />
          <Route path="/projects/:id/analytics" component={Analytics} />
          <Route path="/team-secrets" component={TeamSecrets} />
          <Route path="/docs" component={DocsPage} />
          <Route path="/templates" component={TemplatesPage} />
          <Route path="/guides" component={GuidesPage} />
          <Route path="/ai-copilot" component={AICopilotPage} />
          <Route path="/performance" component={PerformanceInsightsPage} />
          <Route path="/oauth-demo" component={OAuthDemoPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;