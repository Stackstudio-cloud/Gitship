import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Globe, Plus, ExternalLink, CheckCircle, Clock, AlertTriangle, Copy, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Domain {
  id: number;
  domain: string;
  status: 'pending' | 'active' | 'failed';
  sslStatus: 'pending' | 'active' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}

interface DomainManagementProps {
  projectId: number;
}

export default function DomainManagement({ projectId }: DomainManagementProps) {
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "domains"],
    enabled: !!projectId,
  });

  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      return await apiRequest(`/api/projects/${projectId}/domains`, {
        method: "POST",
        body: JSON.stringify({ domain }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Domain Added",
        description: "Your custom domain has been added and is being verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "domains"] });
      setAddDomainOpen(false);
      setDomainInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add domain. Please check the domain and try again.",
        variant: "destructive",
      });
    },
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (domainId: number) => {
      return await apiRequest(`/api/projects/${projectId}/domains/${domainId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Domain Removed",
        description: "Custom domain has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "domains"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove domain. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: number) => {
      return await apiRequest(`/api/projects/${projectId}/domains/${domainId}/verify`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification Started",
        description: "Domain verification has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "domains"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify domain. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "DNS record copied to clipboard.",
    });
  };

  const handleAddDomain = () => {
    if (!domainInput.trim()) return;
    addDomainMutation.mutate(domainInput.trim());
  };

  const defaultDomain = project?.name ? `${project.name}.gitship.app` : '';

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-neon-cyan" />
            <div>
              <CardTitle className="text-white">Domain Management</CardTitle>
              <CardDescription className="text-gray-400">
                Configure custom domains for your project
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon-green text-dark-900 hover:bg-neon-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-800 border-dark-600 text-white">
              <DialogHeader>
                <DialogTitle>Add Custom Domain</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a custom domain to serve your site from your own URL.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain" className="text-white">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com or www.example.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="bg-dark-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter your domain without the protocol (https://)
                  </p>
                </div>
                
                <Alert className="bg-dark-700 border-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    After adding your domain, you'll need to configure DNS records to point to our servers.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddDomainOpen(false)}
                    className="border-gray-600 text-white hover:bg-dark-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDomain}
                    disabled={!domainInput.trim() || addDomainMutation.isPending}
                    className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                  >
                    {addDomainMutation.isPending ? "Adding..." : "Add Domain"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Default GitShip Domain */}
        <div className="border border-dark-600 rounded-lg p-4 bg-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-white font-medium">{defaultDomain}</p>
                <p className="text-sm text-gray-400">Default GitShip domain</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://${defaultDomain}`, '_blank')}
                className="border-gray-600 text-white hover:bg-dark-700"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Domains */}
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-600 rounded-lg animate-pulse"></div>
            <div className="h-16 bg-gray-600 rounded-lg animate-pulse"></div>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No custom domains configured</p>
            <p className="text-sm">Add a custom domain to use your own URL</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Custom Domains</h3>
            {domains.map((domain: Domain) => (
              <div key={domain.id} className="border border-dark-600 rounded-lg p-4 bg-dark-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-neon-cyan" />
                    <div>
                      <p className="text-white font-medium">{domain.domain}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(domain.status)}
                        <span className="text-xs text-gray-400">SSL: {domain.sslStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {domain.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyDomainMutation.mutate(domain.id)}
                        disabled={verifyDomainMutation.isPending}
                        className="border-gray-600 text-white hover:bg-dark-700"
                      >
                        Verify
                      </Button>
                    )}
                    
                    {domain.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                        className="border-gray-600 text-white hover:bg-dark-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDomainMutation.mutate(domain.id)}
                      disabled={removeDomainMutation.isPending}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {domain.status === 'pending' && (
                  <div className="mt-4 p-3 bg-dark-800 rounded border border-gray-600">
                    <p className="text-sm text-white mb-2">DNS Configuration Required:</p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between bg-dark-900 p-2 rounded">
                        <span className="text-gray-300">Type: CNAME</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("CNAME")}
                          className="h-auto p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-dark-900 p-2 rounded">
                        <span className="text-gray-300">Name: {domain.domain}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(domain.domain)}
                          className="h-auto p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-dark-900 p-2 rounded">
                        <span className="text-gray-300">Value: gitship.app</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("gitship.app")}
                          className="h-auto p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}