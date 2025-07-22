import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Code, 
  Globe, 
  Zap, 
  Settings, 
  Users, 
  Shield,
  ArrowRight,
  FileText,
  Terminal,
  GitBranch
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";

export default function DocsPage() {
  const quickStartSteps = [
    {
      title: "Connect Repository",
      description: "Link your GitHub repository to GitShip",
      icon: GitBranch
    },
    {
      title: "Configure Build",
      description: "Set build commands and output directory",
      icon: Terminal
    },
    {
      title: "Deploy",
      description: "Your site goes live automatically",
      icon: Globe
    }
  ];

  const docSections = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "neon-yellow",
      guides: [
        "Quick Start Guide",
        "First Deployment",
        "Understanding Builds",
        "Environment Variables"
      ]
    },
    {
      title: "Build Configuration",
      icon: Settings,
      color: "neon-orange",
      guides: [
        "Build Commands",
        "Framework Detection",
        "Output Directory",
        "Build Plugins"
      ]
    },
    {
      title: "Domains & SSL",
      icon: Globe,
      color: "neon-red",
      guides: [
        "Custom Domains",
        "DNS Configuration",
        "SSL Certificates",
        "Redirects & Rewrites"
      ]
    },
    {
      title: "Team Management",
      icon: Users,
      color: "neon-purple",
      guides: [
        "Inviting Members",
        "Role Permissions",
        "Team Settings",
        "Access Control"
      ]
    },
    {
      title: "Security",
      icon: Shield,
      color: "neon-cyan",
      guides: [
        "Authentication",
        "Environment Secrets",
        "Build Security",
        "Deploy Keys"
      ]
    },
    {
      title: "API Reference",
      icon: Code,
      color: "neon-green",
      guides: [
        "REST API",
        "Webhooks",
        "CLI Commands",
        "SDK Documentation"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PublicNavbar />
      {/* Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="flame-gradient-text">Documentation</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your applications with GitShip
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button className="flame-gradient text-dark-900 font-semibold">
              <Book className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              <FileText className="w-4 h-4 mr-2" />
              API Reference
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Get Started in <span className="flame-gradient-text">3 Steps</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className="bg-dark-800 border-dark-600">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-neon-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-neon-orange" />
                  </div>
                  <CardTitle className="text-white flex items-center justify-center">
                    <Badge className="bg-neon-orange/20 text-neon-orange mr-3">
                      {index + 1}
                    </Badge>
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 px-6 bg-dark-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="flame-gradient-text">Documentation</span> Sections
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, index) => (
              <Card key={index} className="bg-dark-700 border-dark-600 hover:border-neon-orange/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 bg-${section.color}/20 rounded-lg flex items-center justify-center mb-4`}>
                    <section.icon className={`w-6 h-6 text-${section.color}`} />
                  </div>
                  <CardTitle className="text-white group-hover:text-neon-orange transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.guides.map((guide, guideIndex) => (
                      <li key={guideIndex} className="flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {guide}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Popular <span className="flame-gradient-text">Guides</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-dark-800 border-dark-600 hover:border-neon-yellow/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-neon-yellow" />
                  Deploy React App in 5 Minutes
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Step-by-step guide to deploy your React application with automatic builds and previews
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600 hover:border-neon-red/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-neon-red" />
                  Configure Custom Domain
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Learn how to set up your custom domain with SSL certificates and DNS configuration
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600 hover:border-neon-purple/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-neon-purple" />
                  Environment Variables
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage sensitive data and configuration with environment variables and build contexts
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600 hover:border-neon-orange/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-3 text-neon-orange" />
                  Team Collaboration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Set up teams, manage permissions, and collaborate on deployments with your colleagues
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Still need <span className="flame-gradient-text">help</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join our community or reach out to our support team
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="flame-gradient text-dark-900 font-semibold">
              Join Discord Community
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}