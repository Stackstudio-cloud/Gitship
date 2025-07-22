import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw
} from "lucide-react";
import type { Project, Analytics } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

// Mock chart component since we don't have a chart library
const SimpleChart = ({ data, title, color }: { data: number[], title: string, color: string }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-400">{title}</h4>
    <div className="flex items-end space-x-1 h-20">
      {data.map((value, index) => (
        <div key={index} className="flex-1 bg-dark-700 rounded-t flex items-end">
          <div 
            className={`w-full rounded-t transition-all duration-500 ${color}`}
            style={{ height: `${Math.max(value / Math.max(...data) * 100, 5)}%` }}
          />
        </div>
      ))}
    </div>
  </div>
);

export default function Analytics() {
  const [, params] = useRoute("/projects/:id/analytics");
  const projectId = parseInt(params?.id || "0");
  const [timeRange, setTimeRange] = useState("7");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId.toString()],
    enabled: !authLoading && isAuthenticated && projectId > 0,
  });

  const { data: analytics = [], isLoading: analyticsLoading, refetch } = useQuery<Analytics[]>({
    queryKey: ["/api/projects", projectId.toString(), "analytics"],
    enabled: !authLoading && isAuthenticated && projectId > 0,
  });

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !authLoading && isAuthenticated,
  });

  // Mock data for charts
  const pageViewsData = [120, 150, 180, 200, 175, 220, 250];
  const visitorsData = [80, 95, 110, 130, 115, 140, 160];
  const loadTimeData = [1.2, 1.1, 1.3, 1.0, 1.2, 0.9, 1.1];

  const currentAnalytics = analytics[0] || {
    pageViews: 1247,
    uniqueVisitors: 856,
    bandwidth: 2340000000, // 2.34 GB
    avgLoadTime: 1100, // 1.1s
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLoadTime = (ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  };

  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
              <p className="text-gray-400">The project you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar projects={allProjects} activeProjectId={projectId} />
        
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Analytics</h1>
                <p className="text-gray-400">Monitor your site's performance and traffic</p>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 bg-dark-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-800 border-gray-600">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={analyticsLoading}
                  className="border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Content */}
          <div className="p-6 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-dark-800 border-neon-purple/30 hover:border-neon-purple/60 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-neon-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-purple">{currentAnalytics.pageViews?.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-neon-cyan/30 hover:border-neon-cyan/60 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Unique Visitors</CardTitle>
                  <Users className="h-4 w-4 text-neon-cyan" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-cyan">{currentAnalytics.uniqueVisitors?.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.2% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-neon-green/30 hover:border-neon-green/60 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Bandwidth</CardTitle>
                  <Globe className="h-4 w-4 text-neon-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-green">{formatBytes(currentAnalytics.bandwidth || 0)}</div>
                  <div className="flex items-center text-xs text-red-400 mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -3.1% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-orange-500/30 hover:border-orange-500/60 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Avg Load Time</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{formatLoadTime(currentAnalytics.avgLoadTime || 0)}</div>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -5.7% improvement
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-neon-purple" />
                    Traffic Overview
                  </CardTitle>
                  <CardDescription>Page views and visitors over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SimpleChart data={pageViewsData} title="Page Views" color="bg-neon-purple" />
                  <SimpleChart data={visitorsData} title="Unique Visitors" color="bg-neon-cyan" />
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Site performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={loadTimeData} title="Average Load Time (seconds)" color="bg-orange-500" />
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Core Web Vitals</span>
                      <Badge className="bg-neon-green/20 text-neon-green">Good</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Largest Contentful Paint</span>
                        <span className="text-neon-green">1.2s</span>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-2">
                        <div className="bg-neon-green h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">First Input Delay</span>
                        <span className="text-neon-green">45ms</span>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-2">
                        <div className="bg-neon-green h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cumulative Layout Shift</span>
                        <span className="text-orange-500">0.08</span>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages and Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages on your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { path: "/", views: 456, percentage: 37 },
                      { path: "/about", views: 234, percentage: 19 },
                      { path: "/projects", views: 189, percentage: 15 },
                      { path: "/contact", views: 145, percentage: 12 },
                      { path: "/blog", views: 123, percentage: 10 },
                    ].map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-sm text-neon-cyan">{page.path}</span>
                            <span className="text-sm text-gray-400">{page.views} views</span>
                          </div>
                          <div className="w-full bg-dark-600 rounded-full h-2">
                            <div 
                              className="bg-neon-cyan h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${page.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: "Direct", visitors: 342, percentage: 40, color: "bg-neon-green" },
                      { source: "Google", visitors: 256, percentage: 30, color: "bg-neon-cyan" },
                      { source: "GitHub", visitors: 145, percentage: 17, color: "bg-neon-purple" },
                      { source: "Twitter", visitors: 89, percentage: 10, color: "bg-orange-500" },
                      { source: "Other", visitors: 24, percentage: 3, color: "bg-gray-500" },
                    ].map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                          <span className="text-sm">{source.source}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{source.visitors}</span>
                          <span className="text-xs text-gray-500 w-8 text-right">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Visitors */}
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse mr-2"></div>
                  Real-time Visitors
                </CardTitle>
                <CardDescription>Visitors currently on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-neon-green">23</div>
                    <p className="text-sm text-gray-400">Active visitors</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">12</div>
                    <p className="text-xs text-gray-400">Page views in last 30 min</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Active Pages</h4>
                  <div className="space-y-2">
                    {[
                      { path: "/", visitors: 15 },
                      { path: "/projects", visitors: 5 },
                      { path: "/about", visitors: 3 },
                    ].map((page, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-neon-cyan">{page.path}</span>
                        <span className="text-gray-400">{page.visitors} visitors</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}