import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Search, X } from "lucide-react";
import { insertProjectSchema } from "@shared/schema";

interface NewSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockRepos = [
  { name: "portfolio-site", description: "Personal portfolio website", lastUpdated: "2 days ago" },
  { name: "react-dashboard", description: "Admin dashboard built with React", lastUpdated: "1 week ago" },
  { name: "nextjs-blog", description: "Blog site using Next.js", lastUpdated: "3 days ago" },
  { name: "vue-ecommerce", description: "E-commerce platform in Vue.js", lastUpdated: "5 days ago" },
];

const formSchema = insertProjectSchema.extend({
  repositoryName: z.string().min(1, "Repository is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewSiteModal({ open, onOpenChange }: NewSiteModalProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      repositoryUrl: "",
      repositoryName: "",
      branch: "main",
      framework: "Next.js",
      buildCommand: "npm run build",
      outputDirectory: "dist",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { repositoryName, ...projectData } = data;
      return await apiRequest("POST", "/api/projects", {
        ...projectData,
        repositoryUrl: `https://github.com/user/${repositoryName}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onOpenChange(false);
      form.reset();
      setSelectedRepo("");
      setSearchQuery("");
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRepos = mockRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepoSelect = (repoName: string) => {
    setSelectedRepo(repoName);
    form.setValue("repositoryName", repoName);
    form.setValue("name", repoName);
    
    // Auto-detect framework based on repo name
    if (repoName.includes("next")) {
      form.setValue("framework", "Next.js");
      form.setValue("buildCommand", "npm run build");
      form.setValue("outputDirectory", ".next");
    } else if (repoName.includes("react")) {
      form.setValue("framework", "React");
      form.setValue("buildCommand", "npm run build");
      form.setValue("outputDirectory", "dist");
    } else if (repoName.includes("vue")) {
      form.setValue("framework", "Vue.js");
      form.setValue("buildCommand", "npm run build");
      form.setValue("outputDirectory", "dist");
    }
  };

  const onSubmit = (data: FormData) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-800 border-neon-cyan/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Connect Repository
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a repository to deploy and configure your project settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Git Provider Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Git Provider</label>
              <Select defaultValue="github">
                <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-gray-600">
                  <SelectItem value="github">
                    <div className="flex items-center space-x-2">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Repository Search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Repository</label>
              <div className="relative mb-3">
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-700 border-gray-600 text-white pl-10 focus:border-neon-cyan"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Repository List */}
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-2">
                {filteredRepos.map((repo) => (
                  <Card 
                    key={repo.name}
                    className={`cursor-pointer transition-all ${
                      selectedRepo === repo.name 
                        ? 'bg-neon-cyan/10 border-neon-cyan' 
                        : 'bg-dark-700 border-gray-600 hover:border-neon-cyan/50'
                    }`}
                    onClick={() => handleRepoSelect(repo.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{repo.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{repo.description}</p>
                        </div>
                        <span className="text-xs text-gray-400">{repo.lastUpdated}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Project Configuration */}
            {selectedRepo && (
              <div className="space-y-4 border-t border-gray-600 pt-4">
                <h3 className="font-semibold text-white">Project Settings</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Project Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Framework</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-700 border-gray-600">
                          <SelectItem value="Next.js">Next.js</SelectItem>
                          <SelectItem value="React">React</SelectItem>
                          <SelectItem value="Vue.js">Vue.js</SelectItem>
                          <SelectItem value="Svelte">Svelte</SelectItem>
                          <SelectItem value="Astro">Astro</SelectItem>
                          <SelectItem value="Static">Static HTML</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buildCommand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Build Command</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outputDirectory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Output Directory</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-400 hover:border-gray-500"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!selectedRepo || createProjectMutation.isPending}
                className="bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-semibold hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                {createProjectMutation.isPending ? "Creating..." : "Connect & Deploy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
