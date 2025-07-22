import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import NewProjectDialog from "@/components/new-project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, BarChart3, Clock, Globe, TrendingUp, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project, Deployment } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: recentDeployments = [] } = useQuery<Deployment[]>({
    queryKey: ["/api/deployments/recent"],
    retry: false,
    enabled: false, // Disable for now as we don't have this endpoint
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-neon-green text-dark-900';
      case 'building':
        return 'bg-orange-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      case 'queued':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar projects={projects} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="p-8 border-b border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Projects</h1>
                <p className="text-gray-400 mt-2">Manage and deploy your web applications</p>
              </div>
              <NewProjectDialog />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="p-8">
            {projects.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create your first project</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Get started by connecting a GitHub repository and deploying your first site
                </p>
                <NewProjectDialog />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="bg-dark-800 border-dark-600 hover:border-neon-orange/50 transition-all cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white group-hover:text-neon-orange transition-colors">
                            {project.name}
                          </CardTitle>
                          <Badge className="bg-neon-green text-dark-900">
                            Active
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400 line-clamp-2">
                          {project.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>{project.framework || "Auto-detect"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>2 days ago</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {project.repositoryUrl}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}