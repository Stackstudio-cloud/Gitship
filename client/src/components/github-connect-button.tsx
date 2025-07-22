import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function GitHubConnectButton() {
  const { user } = useAuth();
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: async (): Promise<{ authUrl: string }> => {
      const response = await fetch('/api/auth/github', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get GitHub auth URL');
      }
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConnected = user?.githubUsername;

  if (isConnected) {
    return (
      <Card className="bg-dark-800 border-dark-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-white">GitHub Connected</p>
                <p className="text-sm text-gray-400">@{user.githubUsername}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-gray-400" />
          <CardTitle className="text-white">Connect GitHub</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Connect your GitHub account to access repositories and enable automatic deployments
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
        >
          <GitBranch className="w-4 h-4 mr-2" />
          {connectMutation.isPending ? "Connecting..." : "Connect GitHub"}
        </Button>
      </CardContent>
    </Card>
  );
}