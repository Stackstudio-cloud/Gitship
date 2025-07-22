import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Rocket, 
  Activity, 
  Settings, 
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Project } from "@shared/schema";

interface SidebarProps {
  projects: Project[];
  activeProjectId?: number;
}

export default function Sidebar({ projects, activeProjectId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-neon-green/20 text-neon-green";
      case "building":
        return "bg-neon-cyan/20 text-neon-cyan";
      case "failed":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const isProjectRoute = (projectId: number) => {
    return location.includes(`/projects/${projectId}`);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-dark-800 border-r border-dark-600 flex flex-col">
        <div className="p-3 border-b border-dark-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full h-10 p-0 hover:bg-dark-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 p-2 space-y-2">
          {projects.slice(0, 5).map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full h-10 p-0 relative hover:bg-dark-700 ${
                  isProjectRoute(project.id!) ? 'bg-neon-orange/10 border border-neon-orange/30' : ''
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-neon-orange to-neon-purple rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {project.status === "building" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-orange rounded-full animate-pulse" />
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-dark-800 border-r border-dark-600 flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-4 border-b border-dark-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0 hover:bg-dark-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="flame-gradient text-dark-900 hover:opacity-90 transition-opacity"
              onClick={() => window.location.href = '/'}
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-orange focus:outline-none"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 mb-2">No projects yet</p>
            <p className="text-sm text-gray-500">Create your first project to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {projects.map((project) => (
              <Card key={project.id} className="bg-transparent border-0 p-0">
                <Link href={`/projects/${project.id}`}>
                  <div className={`p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-all cursor-pointer ${
                    isProjectRoute(project.id!) ? 'bg-neon-orange/10 border-neon-orange/30' : 'hover:bg-dark-700'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-neon-orange to-neon-purple rounded flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white truncate">{project.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{project.description || 'No description'}</p>
                        </div>
                      </div>
                      {project.status && (
                        <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {project.framework || 'Static'}
                        </span>
                        {project.updatedAt && (
                          <span>
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Project Sub-navigation */}
                {isProjectRoute(project.id!) && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link href={`/projects/${project.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start h-8 text-xs ${
                          location === `/projects/${project.id}` ? 'bg-dark-600 text-neon-cyan' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Activity className="w-3 h-3 mr-2" />
                        Overview
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}/analytics`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start h-8 text-xs ${
                          location === `/projects/${project.id}/analytics` ? 'bg-dark-600 text-neon-cyan' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Activity className="w-3 h-3 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}/settings`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start h-8 text-xs ${
                          location === `/projects/${project.id}/settings` ? 'bg-dark-600 text-neon-cyan' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-600">
        <div className="text-xs text-gray-400 text-center">
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}