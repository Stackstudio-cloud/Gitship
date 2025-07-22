import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, GitBranch } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GitHubConnectButton from "@/components/github-connect-button";
import RepositorySelector from "@/components/repository-selector";

export default function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    branch: "main",
    framework: "",
    buildCommand: "npm run build",
    outputDirectory: "dist",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create project');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created successfully!",
        description: "Your project is being deployed...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        repositoryUrl: "",
        branch: "main",
        framework: "",
        buildCommand: "npm run build",
        outputDirectory: "dist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.githubAccessToken) {
      toast({
        title: "GitHub account required",
        description: "Please connect your GitHub account first",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.repositoryUrl) {
      toast({
        title: "Missing required fields",
        description: "Please fill in project name and repository URL",
        variant: "destructive",
      });
      return;
    }
    
    createProjectMutation.mutate(formData);
  };

  const frameworks = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "nextjs", label: "Next.js" },
    { value: "nuxt", label: "Nuxt.js" },
    { value: "astro", label: "Astro" },
    { value: "svelte", label: "Svelte" },
    { value: "static", label: "Static HTML" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flame-gradient text-dark-900 font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-800 border-dark-600 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your GitHub repository and deploy it with GitShip
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Connection Status */}
          <GitHubConnectButton />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-awesome-project"
                className="bg-dark-700 border-dark-600 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Select
                value={formData.framework}
                onValueChange={(value) => setFormData({ ...formData, framework: value })}
              >
                <SelectTrigger className="bg-dark-700 border-dark-600 text-white">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  {frameworks.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Repository Selection */}
          <RepositorySelector
            value={formData.repositoryUrl}
            onChange={(url) => setFormData({ ...formData, repositoryUrl: url })}
            onRepositorySelect={(repo) => {
              // Auto-fill project name if empty
              if (!formData.name) {
                setFormData(prev => ({ ...prev, name: repo.name }));
              }
              // Auto-fill description if empty
              if (!formData.description && repo.description) {
                setFormData(prev => ({ ...prev, description: repo.description || "" }));
              }
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of your project..."
              className="bg-dark-700 border-dark-600 text-white"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="main"
                className="bg-dark-700 border-dark-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buildCommand">Build Command</Label>
              <Input
                id="buildCommand"
                value={formData.buildCommand}
                onChange={(e) => setFormData({ ...formData, buildCommand: e.target.value })}
                placeholder="npm run build"
                className="bg-dark-700 border-dark-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outputDirectory">Output Directory</Label>
              <Input
                id="outputDirectory"
                value={formData.outputDirectory}
                onChange={(e) => setFormData({ ...formData, outputDirectory: e.target.value })}
                placeholder="dist"
                className="bg-dark-700 border-dark-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-white hover:bg-dark-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="flame-gradient text-dark-900 font-semibold"
            >
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}