import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import BuildLogs from "@/components/build-logs";
import TeamManagement from "@/components/team-management";
import DomainManagement from "@/components/domain-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { 
  ArrowLeft, 
  Rocket, 
  Globe, 
  Settings, 
  Eye,
  ExternalLink,
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Activity,
  BarChart3,
  Terminal,
  Zap,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Project, Deployment } from "@shared/schema";

export default function EnhancedProjectDetail() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/projects/:id");
  const [activeTab, setActiveTab] = useState("overview");

  const projectId = params?.id ? parseInt(params.id) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId && isAuthenticated,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "deployments"],
    enabled: !!projectId && isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/projects", projectId, "analytics"],
    enabled: !!projectId && isAuthenticated,
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        body: JSON.stringify({ environment: "production" }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Deploy Started",
        description: "Your project deployment has been initiated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "deployments"] });
      setActiveTab("builds"); // Switch to builds tab to see live logs
    },
    onError: () => {
      toast({
        title: "Deploy Failed",
        description: "Failed to start deployment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-dark-900 text-white">
        <Navbar />
        <div className="flex">
          <div className="w-64 bg-dark-800 h-screen border-r border-dark-600 animate-pulse"></div>
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="h-8 bg-gray-600 rounded w-1/3 animate-pulse"></div>
              <div className="h-32 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Link href="/dashboard">
              <Button className="bg-neon-green text-dark-900 hover:bg-neon-green/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'building': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Live</Badge>;
      case 'building':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Building</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const latestDeployment = deployments[0];
  const buildingDeployment = deployments.find((d: Deployment) => d.status === 'building');

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />
      
      <div className="flex">
        <Sidebar projects={projects} currentProjectId={projectId} />
        
        <main className="flex-1 overflow-y-auto">
          {/* Project Header */}
          <div className="p-6 border-b border-dark-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    {getStatusBadge(project.status || 'unknown')}
                  </div>
                  <p className="text-gray-400 mt-1">{project.description || 'No description provided'}</p>
                  {project.repositoryUrl && (
                    <div className="flex items-center space-x-2 mt-2">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <a 
                        href={project.repositoryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:underline text-sm"
                      >
                        {project.repositoryUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {latestDeployment?.deployUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(latestDeployment.deployUrl, '_blank')}
                    className="border-gray-600 text-white hover:bg-dark-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Site
                  </Button>
                )}
                
                <Button
                  onClick={() => deployMutation.mutate()}
                  disabled={deployMutation.isPending || !!buildingDeployment}
                  className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {buildingDeployment ? 'Building...' : 'Deploy'}
                </Button>
              </div>
            </div>
          </div>

          {/* Project Tabs */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-dark-800 border-dark-600">
                <TabsTrigger value="overview" className="data-[state=active]:bg-dark-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="builds" className="data-[state=active]:bg-dark-700">
                  <Terminal className="w-4 h-4 mr-2" />
                  Builds
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-dark-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="domains" className="data-[state=active]:bg-dark-700">
                  <Globe className="w-4 h-4 mr-2" />
                  Domains
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-dark-700">
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-dark-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Deployments</p>
                          <p className="text-2xl font-bold text-white">{deployments.length}</p>
                        </div>
                        <Rocket className="w-8 h-8 text-neon-cyan" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Success Rate</p>
                          <p className="text-2xl font-bold text-white">
                            {deployments.length > 0 
                              ? Math.round((deployments.filter((d: Deployment) => d.status === 'success').length / deployments.length) * 100)
                              : 0}%
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-neon-green" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Avg Build Time</p>
                          <p className="text-2xl font-bold text-white">
                            {latestDeployment?.buildTime ? `${latestDeployment.buildTime}s` : '—'}
                          </p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Last Deploy</p>
                          <p className="text-2xl font-bold text-white">
                            {latestDeployment ? new Date(latestDeployment.startedAt).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-neon-purple" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Deployments */}
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Deployments</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest deployment history for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deployments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No deployments yet</p>
                        <p className="text-sm">Deploy your project to see deployment history</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {deployments.slice(0, 5).map((deployment: Deployment) => (
                          <div key={deployment.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-700 border border-dark-600">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(deployment.status)}
                              <div>
                                <p className="text-white font-medium">
                                  {deployment.commitHash || 'Unknown commit'}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {new Date(deployment.startedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(deployment.status)}
                              {deployment.deployUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(deployment.deployUrl, '_blank')}
                                  className="border-gray-600 text-white hover:bg-dark-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="builds" className="space-y-6">
                {buildingDeployment ? (
                  <BuildLogs 
                    deploymentId={buildingDeployment.id!} 
                    status={buildingDeployment.status as any}
                    onRetrigger={() => deployMutation.mutate()}
                  />
                ) : latestDeployment ? (
                  <BuildLogs 
                    deploymentId={latestDeployment.id!} 
                    status={latestDeployment.status as any}
                    onRetrigger={() => deployMutation.mutate()}
                  />
                ) : (
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-12 text-center">
                      <Terminal className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Build Logs Available</h3>
                      <p className="text-gray-400 mb-6">Deploy your project to see build logs and real-time updates.</p>
                      <Button
                        onClick={() => deployMutation.mutate()}
                        disabled={deployMutation.isPending}
                        className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Start First Deploy
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Analytics content will be rendered by existing analytics components */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Page Views</p>
                          <p className="text-2xl font-bold text-white">
                            {analytics?.[0]?.pageViews?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-neon-cyan" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Unique Visitors</p>
                          <p className="text-2xl font-bold text-white">
                            {analytics?.[0]?.uniqueVisitors?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-neon-green" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Avg Load Time</p>
                          <p className="text-2xl font-bold text-white">
                            {analytics?.[0]?.avgLoadTime ? `${(analytics[0].avgLoadTime / 1000).toFixed(2)}s` : '0s'}
                          </p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Bandwidth</p>
                          <p className="text-2xl font-bold text-white">
                            {analytics?.[0]?.bandwidth ? `${(analytics[0].bandwidth / 1024 / 1024 / 1024).toFixed(2)} GB` : '0 GB'}
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-neon-purple" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="domains" className="space-y-6">
                <DomainManagement projectId={projectId!} />
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <TeamManagement projectId={projectId!} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Project Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure your project settings and build configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Settings panel coming soon</p>
                      <p className="text-sm">Configure build settings, environment variables, and more</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}