import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Play, GitBranch, Package, Settings } from "lucide-react";

interface DeploymentSettingsProps {
  projectId: number;
  buildCommand?: string;
  outputDirectory?: string;
  nodeVersion?: string;
  installCommand?: string;
  autoDeploy?: boolean;
  onUpdate?: (settings: any) => void;
}

export default function DeploymentSettings({
  projectId,
  buildCommand = "npm run build",
  outputDirectory = "dist",
  nodeVersion = "18",
  installCommand = "npm install",
  autoDeploy = true,
  onUpdate
}: DeploymentSettingsProps) {
  const [settings, setSettings] = useState({
    buildCommand,
    outputDirectory,
    nodeVersion,
    installCommand,
    autoDeploy
  });

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate?.(newSettings);
  };

  const presets = {
    "Next.js": {
      buildCommand: "npm run build",
      outputDirectory: ".next",
      installCommand: "npm install"
    },
    "React": {
      buildCommand: "npm run build",
      outputDirectory: "dist",
      installCommand: "npm install"
    },
    "Vue.js": {
      buildCommand: "npm run build",
      outputDirectory: "dist",
      installCommand: "npm install"
    },
    "Svelte": {
      buildCommand: "npm run build",
      outputDirectory: "dist",
      installCommand: "npm install"
    },
    "Astro": {
      buildCommand: "npm run build",
      outputDirectory: "dist",
      installCommand: "npm install"
    }
  };

  const applyPreset = (framework: string) => {
    const preset = presets[framework as keyof typeof presets];
    if (preset) {
      const newSettings = { ...settings, ...preset };
      setSettings(newSettings);
      onUpdate?.(newSettings);
    }
  };

  return (
    <div className="space-y-6">
      {/* Framework Presets */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-neon-purple" />
            Framework Presets
          </CardTitle>
          <CardDescription>
            Quick setup for popular frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.keys(presets).map((framework) => (
              <Button
                key={framework}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(framework)}
                className="border-gray-600 text-gray-300 hover:border-neon-purple hover:text-neon-purple"
              >
                {framework}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Build Settings */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="w-5 h-5 mr-2 text-neon-cyan" />
            Build Configuration
          </CardTitle>
          <CardDescription>
            Configure how your site is built and deployed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Install Command</Label>
              <Input
                value={settings.installCommand}
                onChange={(e) => handleChange("installCommand", e.target.value)}
                className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan font-mono"
                placeholder="npm install"
              />
              <p className="text-xs text-gray-400">Command to install dependencies</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Build Command</Label>
              <Input
                value={settings.buildCommand}
                onChange={(e) => handleChange("buildCommand", e.target.value)}
                className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan font-mono"
                placeholder="npm run build"
              />
              <p className="text-xs text-gray-400">Command to build your site</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Publish Directory</Label>
              <Input
                value={settings.outputDirectory}
                onChange={(e) => handleChange("outputDirectory", e.target.value)}
                className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan font-mono"
                placeholder="dist"
              />
              <p className="text-xs text-gray-400">Directory to deploy from</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Node Version</Label>
              <Select value={settings.nodeVersion} onValueChange={(value) => handleChange("nodeVersion", value)}>
                <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-gray-600">
                  <SelectItem value="16">Node.js 16</SelectItem>
                  <SelectItem value="18">Node.js 18</SelectItem>
                  <SelectItem value="20">Node.js 20</SelectItem>
                  <SelectItem value="21">Node.js 21</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">Runtime version for builds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Settings */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-neon-green" />
            Deploy Settings
          </CardTitle>
          <CardDescription>
            Control when and how deployments happen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Auto Deploy</Label>
              <p className="text-sm text-gray-400">
                Automatically deploy when you push to the main branch
              </p>
            </div>
            <Switch
              checked={settings.autoDeploy}
              onCheckedChange={(checked) => handleChange("autoDeploy", checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-600">
            <div className="space-y-2">
              <Label className="text-white">Deploy Branch</Label>
              <Input
                value="main"
                disabled
                className="bg-dark-700 border-gray-600 text-gray-400"
              />
              <p className="text-xs text-gray-400">Branch to deploy from</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Deploy Context</Label>
              <Select defaultValue="production">
                <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-gray-600">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">Deployment environment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-orange-500" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune your deployment process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Build Timeout</Label>
              <Select defaultValue="15">
                <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-gray-600">
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Cache Strategy</Label>
              <Select defaultValue="smart">
                <SelectTrigger className="bg-dark-700 border-gray-600 text-white focus:border-neon-cyan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-gray-600">
                  <SelectItem value="smart">Smart Cache</SelectItem>
                  <SelectItem value="aggressive">Aggressive Cache</SelectItem>
                  <SelectItem value="minimal">Minimal Cache</SelectItem>
                  <SelectItem value="none">No Cache</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-600">
            <Badge variant="secondary" className="bg-dark-700 text-gray-300">
              Build Plugins: Enabled
            </Badge>
            <Badge variant="secondary" className="bg-dark-700 text-gray-300">
              Asset Optimization: On
            </Badge>
            <Badge variant="secondary" className="bg-dark-700 text-gray-300">
              Source Maps: Production
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}