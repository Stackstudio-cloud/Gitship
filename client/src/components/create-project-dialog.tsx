import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Github, Globe } from "lucide-react";

const createProjectFormSchema = insertProjectSchema.extend({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
}

export default function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      repositoryUrl: "",
      buildCommand: "npm run build",
      outputDir: "dist",
      framework: "react",
      nodeVersion: "18",
      isActive: true,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      return await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your project has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      console.error("Create project error:", error);
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-neon-green text-dark-900 hover:bg-neon-green/90">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-dark-800 border-dark-600 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Deploy your project to GitShip in seconds. Connect your Git repository and configure your build settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-neon-cyan" />
                Project Details
              </h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-awesome-project"
                        className="bg-dark-700 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of your project..."
                        className="bg-dark-700 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Repository Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Github className="w-5 h-5 mr-2 text-neon-purple" />
                Repository
              </h3>
              
              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Git Repository URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/username/repository"
                        className="bg-dark-700 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Build Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Build Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Framework</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-700 border-gray-600">
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="vue">Vue</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                          <SelectItem value="svelte">Svelte</SelectItem>
                          <SelectItem value="nextjs">Next.js</SelectItem>
                          <SelectItem value="nuxt">Nuxt.js</SelectItem>
                          <SelectItem value="static">Static HTML</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nodeVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Node.js Version</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-700 border-gray-600">
                          <SelectItem value="20">20.x</SelectItem>
                          <SelectItem value="18">18.x</SelectItem>
                          <SelectItem value="16">16.x</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="buildCommand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Build Command</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="npm run build"
                        className="bg-dark-700 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputDir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Output Directory</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="dist"
                        className="bg-dark-700 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
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
                className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}