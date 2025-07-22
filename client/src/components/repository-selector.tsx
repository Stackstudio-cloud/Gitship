import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Search, Star, GitFork, Clock, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
  private: boolean;
}

interface RepositorySelectorProps {
  value?: string;
  onChange: (repositoryUrl: string) => void;
  onRepositorySelect?: (repo: Repository) => void;
}

export default function RepositorySelector({ 
  value, 
  onChange, 
  onRepositorySelect 
}: RepositorySelectorProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const { data: repositories = [], isLoading, error, refetch } = useQuery<Repository[]>({
    queryKey: ["/api/github/repositories"],
    enabled: !!user?.githubAccessToken,
    retry: false,
  });

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    onChange(repo.html_url);
    onRepositorySelect?.(repo);
  };

  const handleManualInput = (url: string) => {
    setSelectedRepo(null);
    onChange(url);
  };

  if (!user?.githubAccessToken) {
    return (
      <div className="space-y-2">
        <Label htmlFor="repositoryUrl">Repository URL</Label>
        <Input
          id="repositoryUrl"
          value={value || ""}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="bg-dark-700 border-dark-600 text-white"
        />
        <p className="text-sm text-gray-400">
          Connect your GitHub account above to browse repositories
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Repository</Label>
        <div className="text-center p-4 bg-dark-700 rounded-lg border border-dark-600">
          <p className="text-red-400 mb-2">Failed to load repositories</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-gray-600 text-gray-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Repository</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-700 border-dark-600 text-white pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredRepos.length === 0 ? (
            <p className="text-center text-gray-400 py-4">
              {searchTerm ? "No repositories found" : "No repositories available"}
            </p>
          ) : (
            filteredRepos.map((repo) => (
              <Card
                key={repo.id}
                className={`cursor-pointer transition-all ${
                  selectedRepo?.id === repo.id
                    ? "bg-neon-cyan/10 border-neon-cyan/50"
                    : "bg-dark-700 border-dark-600 hover:border-gray-500"
                }`}
                onClick={() => handleRepoSelect(repo)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white truncate">
                          {repo.name}
                        </h4>
                        {repo.private && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                            Private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {repo.language && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center">
                          <GitFork className="w-3 h-3 mr-1" />
                          {repo.forks_count}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="manualUrl">Or enter repository URL manually</Label>
        <Input
          id="manualUrl"
          value={selectedRepo ? selectedRepo.html_url : value || ""}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="bg-dark-700 border-dark-600 text-white"
        />
      </div>
    </div>
  );
}