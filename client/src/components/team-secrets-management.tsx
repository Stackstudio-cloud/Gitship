
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Key, Plus, Eye, EyeOff, Edit2, Trash2, Shield, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamSecret {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeamSecretsManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<TeamSecret | null>(null);
  const [newSecret, setNewSecret] = useState({ key: "", value: "", description: "" });
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamSecrets = [], isLoading } = useQuery({
    queryKey: ["/api/team/secrets"],
  });

  const createSecretMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; description?: string }) => {
      return await apiRequest("/api/team/secrets", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Secret Created",
        description: "Team secret has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/secrets"] });
      setCreateDialogOpen(false);
      setNewSecret({ key: "", value: "", description: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create secret. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSecretMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; description?: string }) => {
      return await apiRequest(`/api/team/secrets/${data.key}`, {
        method: "PUT",
        body: JSON.stringify({ value: data.value, description: data.description }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Secret Updated",
        description: "Team secret has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/secrets"] });
      setEditDialogOpen(false);
      setEditingSecret(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update secret. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSecretMutation = useMutation({
    mutationFn: async (key: string) => {
      return await apiRequest(`/api/team/secrets/${key}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Secret Deleted",
        description: "Team secret has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/secrets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete secret. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleSecretVisibility = (key: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleSecrets(newVisible);
  };

  const handleCreateSecret = () => {
    if (!newSecret.key || !newSecret.value) {
      toast({
        title: "Validation Error",
        description: "Key and value are required.",
        variant: "destructive",
      });
      return;
    }
    createSecretMutation.mutate(newSecret);
  };

  const handleEditSecret = (secret: TeamSecret) => {
    setEditingSecret(secret);
    setEditDialogOpen(true);
  };

  const handleUpdateSecret = () => {
    if (!editingSecret) return;
    updateSecretMutation.mutate({
      key: editingSecret.key,
      value: editingSecret.value,
      description: editingSecret.description,
    });
  };

  const handleDeleteSecret = (key: string) => {
    if (confirm("Are you sure you want to delete this team secret?")) {
      deleteSecretMutation.mutate(key);
    }
  };

  const maskValue = (value: string) => {
    return "•".repeat(Math.min(value.length, 20));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-neon-purple" />
            <div>
              <CardTitle className="text-white">Team Secrets</CardTitle>
              <CardDescription>
                Manage shared secrets accessible across all projects
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon-green text-dark-900 hover:bg-neon-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Secret
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-800 border-dark-600">
              <DialogHeader>
                <DialogTitle className="text-white">Create Team Secret</DialogTitle>
                <DialogDescription>
                  Add a new secret that will be available to all team projects
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="secret-key" className="text-white">Key *</Label>
                  <Input
                    id="secret-key"
                    value={newSecret.key}
                    onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value })}
                    placeholder="e.g., DATABASE_URL, API_KEY"
                    className="bg-dark-700 border-dark-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="secret-value" className="text-white">Value *</Label>
                  <Input
                    id="secret-value"
                    type="password"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                    placeholder="Enter secret value"
                    className="bg-dark-700 border-dark-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="secret-description" className="text-white">Description</Label>
                  <Textarea
                    id="secret-description"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                    placeholder="Optional description for this secret"
                    className="bg-dark-700 border-dark-600 text-white"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCreateDialogOpen(false)}
                    variant="outline"
                    className="border-dark-600 text-gray-300 hover:bg-dark-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSecret}
                    disabled={!newSecret.key || !newSecret.value || createSecretMutation.isPending}
                    className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                  >
                    {createSecretMutation.isPending ? "Creating..." : "Create Secret"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="bg-dark-700 border-dark-600">
          <Users className="w-4 h-4" />
          <AlertDescription className="text-gray-300">
            Team secrets are automatically available as environment variables in all projects. 
            Access them in your code using <code className="bg-dark-600 px-1 rounded">process.env.YOUR_SECRET_KEY</code>
          </AlertDescription>
        </Alert>

        {teamSecrets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No team secrets yet</p>
            <p className="text-sm">Create shared secrets for your team projects</p>
          </div>
        ) : (
          teamSecrets.map((secret: TeamSecret) => (
            <div key={secret.key} className="flex items-center justify-between p-4 rounded-lg bg-dark-700 border border-dark-600">
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <code className="text-neon-cyan font-mono">{secret.key}</code>
                  <Badge variant="secondary" className="bg-dark-600 text-gray-300 text-xs">
                    Team Secret
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-300">
                    {visibleSecrets.has(secret.key) ? secret.value : maskValue(secret.value)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSecretVisibility(secret.key)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {visibleSecrets.has(secret.key) ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                
                {secret.description && (
                  <p className="text-xs text-gray-400">{secret.description}</p>
                )}
                
                <p className="text-xs text-gray-500">
                  Added by {secret.createdBy} • {new Date(secret.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-dark-700 border-dark-600">
                  <DropdownMenuItem
                    onClick={() => handleEditSecret(secret)}
                    className="text-white hover:bg-dark-600"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteSecret(secret.key)}
                    className="text-red-400 hover:bg-dark-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-dark-800 border-dark-600">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Team Secret</DialogTitle>
              <DialogDescription>
                Update the secret value and description
              </DialogDescription>
            </DialogHeader>
            
            {editingSecret && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Key</Label>
                  <Input
                    value={editingSecret.key}
                    disabled
                    className="bg-dark-700 border-dark-600 text-gray-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-secret-value" className="text-white">Value *</Label>
                  <Input
                    id="edit-secret-value"
                    type="password"
                    value={editingSecret.value}
                    onChange={(e) => setEditingSecret({ ...editingSecret, value: e.target.value })}
                    className="bg-dark-700 border-dark-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-secret-description" className="text-white">Description</Label>
                  <Textarea
                    id="edit-secret-description"
                    value={editingSecret.description || ""}
                    onChange={(e) => setEditingSecret({ ...editingSecret, description: e.target.value })}
                    placeholder="Optional description for this secret"
                    className="bg-dark-700 border-dark-600 text-white"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setEditDialogOpen(false)}
                    variant="outline"
                    className="border-dark-600 text-gray-300 hover:bg-dark-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSecret}
                    disabled={!editingSecret.value || updateSecretMutation.isPending}
                    className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                  >
                    {updateSecretMutation.isPending ? "Updating..." : "Update Secret"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
