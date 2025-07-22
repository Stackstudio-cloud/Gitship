
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import TeamSecretsManagement from "@/components/team-secrets-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, Users, Lock, Code } from "lucide-react";

export default function TeamSecrets() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-8">
              <Shield className="w-8 h-8 text-neon-purple" />
              <div>
                <h1 className="text-3xl font-bold text-white">Team Secrets</h1>
                <p className="text-gray-400">Manage shared secrets for all team projects</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Key className="w-8 h-8 text-neon-green" />
                    <div>
                      <CardTitle className="text-white text-lg">Global Access</CardTitle>
                      <CardDescription>
                        Secrets are available in all projects automatically
                      </CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-neon-cyan" />
                    <div>
                      <CardTitle className="text-white text-lg">Team Shared</CardTitle>
                      <CardDescription>
                        All trusted team members can manage secrets
                      </CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-8 h-8 text-neon-purple" />
                    <div>
                      <CardTitle className="text-white text-lg">Secure</CardTitle>
                      <CardDescription>
                        Encrypted storage with controlled access
                      </CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Examples */}
            <Card className="bg-dark-800 border-dark-600 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-neon-cyan" />
                  Usage Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Node.js/JavaScript</h4>
                  <code className="block bg-dark-700 p-3 rounded text-neon-green font-mono text-sm">
                    const dbUrl = process.env.DATABASE_URL;<br/>
                    const apiKey = process.env.API_KEY;
                  </code>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Python</h4>
                  <code className="block bg-dark-700 p-3 rounded text-neon-green font-mono text-sm">
                    import os<br/>
                    db_url = os.getenv('DATABASE_URL')<br/>
                    api_key = os.getenv('API_KEY')
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Team Secrets Management */}
            <TeamSecretsManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
