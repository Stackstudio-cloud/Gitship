import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnvironmentVariable {
  key: string;
  value: string;
  hidden?: boolean;
}

interface EnvironmentVariablesProps {
  projectId: number;
  variables?: EnvironmentVariable[];
  onUpdate?: (variables: EnvironmentVariable[]) => void;
}

export default function EnvironmentVariables({ 
  projectId, 
  variables = [], 
  onUpdate 
}: EnvironmentVariablesProps) {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>(variables);
  const [newVar, setNewVar] = useState({ key: "", value: "" });
  const [hiddenVars, setHiddenVars] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const addVariable = () => {
    if (newVar.key && newVar.value) {
      const updatedVars = [...envVars, { ...newVar, hidden: true }];
      setEnvVars(updatedVars);
      setNewVar({ key: "", value: "" });
      onUpdate?.(updatedVars);
      
      toast({
        title: "Environment Variable Added",
        description: "The variable will be available in your next deployment.",
      });
    }
  };

  const removeVariable = (index: number) => {
    const updatedVars = envVars.filter((_, i) => i !== index);
    setEnvVars(updatedVars);
    onUpdate?.(updatedVars);
    
    toast({
      title: "Environment Variable Removed",
      description: "The variable has been removed.",
    });
  };

  const toggleVisibility = (index: number) => {
    const newHidden = new Set(hiddenVars);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenVars(newHidden);
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 12));

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-neon-green" />
          Environment Variables
        </CardTitle>
        <CardDescription>
          Securely store configuration values and API keys for your deployments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new variable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-dark-700 rounded-lg border border-gray-600">
          <div className="space-y-2">
            <Label className="text-white">Variable Name</Label>
            <Input
              value={newVar.key}
              onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              className="bg-dark-600 border-gray-500 text-white focus:border-neon-cyan"
              placeholder="API_KEY"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Value</Label>
            <div className="flex space-x-2">
              <Input
                value={newVar.value}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                className="bg-dark-600 border-gray-500 text-white focus:border-neon-cyan"
                placeholder="your-api-key-here"
                type="password"
              />
              <Button
                type="button"
                onClick={addVariable}
                disabled={!newVar.key || !newVar.value}
                className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Existing variables */}
        <div className="space-y-2">
          {envVars.map((envVar, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-neon-cyan font-medium">
                      {envVar.key}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-dark-600 text-gray-400">
                      {envVar.value.length} chars
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-sm text-gray-300">
                      {hiddenVars.has(index) ? maskValue(envVar.value) : envVar.value}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(index)}
                  className="text-gray-400 hover:text-white hover:bg-dark-600"
                >
                  {hiddenVars.has(index) ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {envVars.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No environment variables configured</p>
              <p className="text-sm mt-1">Add your first environment variable above</p>
            </div>
          )}
        </div>
        
        {envVars.length > 0 && (
          <div className="text-xs text-gray-400 bg-dark-700 p-3 rounded-lg border border-gray-600">
            <strong>Note:</strong> Environment variables are encrypted and only available during build and runtime. 
            Changes will take effect in your next deployment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}