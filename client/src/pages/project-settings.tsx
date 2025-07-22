import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Globe, 
  Code, 
  Shield, 
  Trash2, 
  Plus, 
  X,
  Save,
  RefreshCw
} from "lucide-react";
import type { Project } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

const settingsSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  buildCommand: z.string().min(1, "Build command is required"),
  outputDirectory: z.string().min(1, "Output directory is required"),
  framework: z.string().optional(),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean(),
});

const envVarSchema = z.object({
  key: z.string().min(1, "Variable name is required"),
  value: z.string().min(1, "Variable value is required"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;
type EnvVarFormData = z.infer<typeof envVarSchema>;

export default function ProjectSettings() {
  const [, params] = useRoute("/projects/:id/settings");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [envVars, setEnvVars] = useState<Array<{key: string, value: string}>>([]);
  const [newEnvVar, setNewEnvVar] = useState<{key: string, value: string}>({key: "", value: ""});

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

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !authLoading && isAuthenticated,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      description: "",
      buildCommand: "npm run build",
      outputDirectory: "dist",
      framework: "",
      customDomain: "",
      sslEnabled: false,
    },
  });

  // Update form when project data loads
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        buildCommand: project.buildCommand || "npm run build",
        outputDirectory: project.outputDirectory || "dist",
        framework: project.framework || "",
        customDomain: project.customDomain || "",
        sslEnabled: project.sslEnabled || false,
      });
      
      // Mock environment variables
      setEnvVars([
        { key: "NODE_ENV", value: "production" },
        { key: "API_URL", value: "https://api.example.com" },
      ]);
    }
  }, [project, form]);

  const updateProjectMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Project settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId.toString()] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Failed to Save Settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully.",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Failed to Delete Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateProjectMutation.mutate(data);
  };

  const addEnvVar = () => {
    if (newEnvVar.key && newEnvVar.value) {
      setEnvVars([...envVars, newEnvVar]);
      setNewEnvVar({key: "", value: ""});
      toast({
        title: "Environment Variable Added",
        description: "The environment variable will be available in your next deployment.",
      });
    }
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
    toast({
      title: "Environment Variable Removed",
      description: "The environment variable has been removed.",
    });
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
                <h1 className="text-2xl font-bold mb-2">Project Settings</h1>
                <p className="text-gray-400">Configure your project deployment settings</p>
              </div>
              <Badge className="bg-neon-green/20 text-neon-green">
                {project.name}
              </Badge>
            </div>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="bg-dark-800 border border-dark-600">
                <TabsTrigger 
                  value="general" 
                  className="data-[state=active]:bg-neon-cyan data-[state=active]:text-dark-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="build"
                  className="data-[state=active]:bg-neon-cyan data-[state=active]:text-dark-900"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Build & Deploy
                </TabsTrigger>
                <TabsTrigger 
                  value="domain"
                  className="data-[state=active]:bg-neon-cyan data-[state=active]:text-dark-900"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Domain
                </TabsTrigger>
                <TabsTrigger 
                  value="environment"
                  className="data-[state=active]:bg-neon-cyan data-[state=active]:text-dark-900"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Environment
                </TabsTrigger>
                <TabsTrigger 
                  value="danger"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Danger Zone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="general" className="space-y-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardHeader>
                      <CardTitle>Project Information</CardTitle>
                      <CardDescription>Basic details about your project</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                        />
                        {form.formState.errors.name && (
                          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          {...form.register("description")}
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                          placeholder="Optional project description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="framework">Framework</Label>
                        <Select
                          value={form.watch("framework")}
                          onValueChange={(value) => form.setValue("framework", value)}
                        >
                          <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-gray-600">
                            <SelectItem value="Next.js">Next.js</SelectItem>
                            <SelectItem value="React">React</SelectItem>
                            <SelectItem value="Vue.js">Vue.js</SelectItem>
                            <SelectItem value="Svelte">Svelte</SelectItem>
                            <SelectItem value="Astro">Astro</SelectItem>
                            <SelectItem value="Static">Static HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="build" className="space-y-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardHeader>
                      <CardTitle>Build Settings</CardTitle>
                      <CardDescription>Configure how your site is built and deployed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="buildCommand">Build Command</Label>
                        <Input
                          id="buildCommand"
                          {...form.register("buildCommand")}
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan font-mono"
                          placeholder="npm run build"
                        />
                        {form.formState.errors.buildCommand && (
                          <p className="text-red-500 text-sm">{form.formState.errors.buildCommand.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="outputDirectory">Publish Directory</Label>
                        <Input
                          id="outputDirectory"
                          {...form.register("outputDirectory")}
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan font-mono"
                          placeholder="dist"
                        />
                        {form.formState.errors.outputDirectory && (
                          <p className="text-red-500 text-sm">{form.formState.errors.outputDirectory.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="domain" className="space-y-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardHeader>
                      <CardTitle>Custom Domain</CardTitle>
                      <CardDescription>Set up a custom domain for your site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Default Domain</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${project.name}.gitship.app`}
                            disabled
                            className="bg-dark-700 border-gray-600 text-gray-400"
                          />
                          <Badge className="bg-neon-green/20 text-neon-green">Active</Badge>
                        </div>
                      </div>
                      
                      <Separator className="bg-dark-600" />
                      
                      <div className="space-y-2">
                        <Label htmlFor="customDomain">Custom Domain</Label>
                        <Input
                          id="customDomain"
                          {...form.register("customDomain")}
                          className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan"
                          placeholder="www.example.com"
                        />
                        <p className="text-xs text-gray-400">
                          Add a CNAME record pointing to {project.name}.gitship.app
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ssl"
                          checked={form.watch("sslEnabled")}
                          onCheckedChange={(checked) => form.setValue("sslEnabled", checked)}
                        />
                        <Label htmlFor="ssl">Force HTTPS</Label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="environment" className="space-y-6">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardHeader>
                      <CardTitle>Environment Variables</CardTitle>
                      <CardDescription>Manage environment variables for your deployments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add new environment variable */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-dark-700 rounded-lg border border-gray-600">
                        <div className="space-y-2">
                          <Label>Variable Name</Label>
                          <Input
                            value={newEnvVar.key}
                            onChange={(e) => setNewEnvVar({...newEnvVar, key: e.target.value})}
                            className="bg-dark-600 border-gray-500 text-white focus:border-neon-cyan"
                            placeholder="API_KEY"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={newEnvVar.value}
                              onChange={(e) => setNewEnvVar({...newEnvVar, value: e.target.value})}
                              className="bg-dark-600 border-gray-500 text-white focus:border-neon-cyan"
                              placeholder="your-api-key-here"
                              type="password"
                            />
                            <Button
                              type="button"
                              onClick={addEnvVar}
                              className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Existing environment variables */}
                      <div className="space-y-2">
                        {envVars.map((envVar, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-4">
                              <span className="font-mono text-neon-cyan">{envVar.key}</span>
                              <span className="text-gray-400">•••••••••••••</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEnvVar(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {envVars.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No environment variables configured</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="danger" className="space-y-6">
                  <Card className="bg-dark-800 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-400">Danger Zone</CardTitle>
                      <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h4 className="font-semibold text-red-400 mb-2">Delete Project</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Once you delete a project, there is no going back. This will permanently delete 
                            your project, deployments, and all associated data.
                          </p>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-dark-800 border-red-500/30">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This action cannot be undone. This will permanently delete the 
                                  "{project.name}" project and remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-600 text-gray-400 hover:border-gray-500">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProjectMutation.mutate()}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deleteProjectMutation.isPending}
                                >
                                  {deleteProjectMutation.isPending ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                  )}
                                  Delete Project
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Save Button (for non-danger tabs) */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProjectMutation.isPending}
                    className="bg-neon-green text-dark-900 font-semibold hover:bg-neon-green/90"
                  >
                    {updateProjectMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}