import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ExternalLink, Clock, GitBranch } from "lucide-react";
import type { Deployment } from "@shared/schema";

interface DeploymentCardProps {
  deployment: Deployment;
  onViewLogs?: () => void;
}

export default function DeploymentCard({ deployment, onViewLogs }: DeploymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-neon-green text-dark-900';
      case 'building':
        return 'bg-orange-500 text-white animate-pulse';
      case 'failed':
        return 'bg-red-500 text-white';
      case 'queued':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-neon-green';
      case 'building':
        return 'bg-orange-500 animate-pulse';
      case 'failed':
        return 'bg-red-500';
      case 'queued':
        return 'bg-gray-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (startTime?: Date | null, endTime?: Date | null) => {
    if (!startTime) return null;
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - new Date(startTime).getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <Card className="bg-dark-700 border-gray-600 hover:bg-dark-700/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${getStatusDot(deployment.status)}`}></div>
            <span className="text-sm font-mono text-neon-green">#{deployment.commitHash}</span>
            <Badge className={`text-xs ${getStatusColor(deployment.status)}`}>
              {deployment.status === 'success' ? 'Published' :
               deployment.status === 'building' ? 'Building' :
               deployment.status === 'failed' ? 'Failed' :
               'Queued'}
            </Badge>
          </div>
          <span className="text-xs text-gray-400">
            {deployment.createdAt && formatTimeAgo(deployment.createdAt)}
          </span>
        </div>
        
        <p className="text-sm mb-2 text-gray-300">
          {deployment.commitMessage || 'No commit message'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <GitBranch className="w-3 h-3 mr-1" />
              {deployment.branch}
            </span>
            {deployment.buildTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Build: {formatDuration(deployment.startedAt, deployment.completedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {deployment.deployUrl && deployment.status === 'success' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-neon-cyan hover:bg-neon-cyan/10 h-6 px-2"
                onClick={() => window.open(deployment.deployUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit
              </Button>
            )}
            {onViewLogs && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewLogs}
                className="text-neon-cyan hover:bg-neon-cyan/10 h-6 px-2"
              >
                <Eye className="w-3 h-3 mr-1" />
                Logs
              </Button>
            )}
          </div>
        </div>
        
        {deployment.status === 'building' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Building...</span>
              <span>68%</span>
            </div>
            <div className="w-full bg-dark-600 rounded-full h-1 overflow-hidden">
              <div className="bg-orange-500 h-1 animate-build-progress"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
