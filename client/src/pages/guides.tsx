import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Clock,
  User,
  ChevronRight,
  Zap,
  Globe,
  Settings,
  Shield,
  Code,
  GitBranch,
  Terminal,
  Database,
  Smartphone,
  Palette,
  BookOpen,
  Play,
  FileText,
  Users
} from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/components/public-navbar";

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Guides", count: 32 },
    { id: "getting-started", name: "Getting Started", count: 8 },
    { id: "deployment", name: "Deployment", count: 12 },
    { id: "domains", name: "Domains & SSL", count: 6 },
    { id: "teams", name: "Teams", count: 4 },
    { id: "advanced", name: "Advanced", count: 2 }
  ];

  const guides = [
    {
      id: 1,
      title: "Deploy Your First Site",
      description: "Get started with GitShip by deploying your first project in under 5 minutes",
      category: "getting-started",
      difficulty: "Beginner",
      readTime: "5 min",
      author: "GitShip Team",
      tags: ["Quick Start", "First Deploy", "GitHub"],
      featured: true
    },
    {
      id: 2,
      title: "Custom Domain Setup",
      description: "Configure your custom domain with SSL certificates and DNS settings",
      category: "domains",
      difficulty: "Intermediate",
      readTime: "10 min",
      author: "GitShip Team",
      tags: ["Custom Domain", "SSL", "DNS", "Configuration"]
    },
    {
      id: 3,
      title: "Environment Variables",
      description: "Securely manage environment variables and build contexts across deployments",
      category: "deployment",
      difficulty: "Beginner",
      readTime: "7 min",
      author: "GitShip Team",
      tags: ["Environment", "Security", "Configuration"]
    },
    {
      id: 4,
      title: "Team Collaboration",
      description: "Set up teams, manage permissions, and collaborate on projects effectively",
      category: "teams",
      difficulty: "Intermediate",
      readTime: "12 min",
      author: "GitShip Team",
      tags: ["Teams", "Permissions", "Collaboration"]
    },
    {
      id: 5,
      title: "Build Configuration",
      description: "Optimize your build process with custom commands and framework detection",
      category: "deployment",
      difficulty: "Intermediate",
      readTime: "15 min",
      author: "GitShip Team",
      tags: ["Build", "Commands", "Optimization"]
    },
    {
      id: 6,
      title: "Redirects & Rewrites",
      description: "Configure URL redirects and rewrites for better SEO and user experience",
      category: "advanced",
      difficulty: "Advanced",
      readTime: "20 min",
      author: "GitShip Team",
      tags: ["Redirects", "SEO", "Advanced"]
    },
    {
      id: 7,
      title: "React App Deployment",
      description: "Complete guide to deploying React applications with automatic builds",
      category: "deployment",
      difficulty: "Beginner",
      readTime: "8 min",
      author: "GitShip Team",
      tags: ["React", "JavaScript", "SPA"]
    },
    {
      id: 8,
      title: "Next.js Deployment",
      description: "Deploy Next.js applications with SSR, API routes, and static generation",
      category: "deployment",
      difficulty: "Intermediate",
      readTime: "18 min",
      author: "GitShip Team",
      tags: ["Next.js", "SSR", "API Routes"]
    }
  ];

  const featuredGuides = guides.filter(g => g.featured);
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-600/20 text-green-400";
      case "Intermediate": return "bg-neon-orange/20 text-neon-orange";
      case "Advanced": return "bg-red-600/20 text-red-400";
      default: return "bg-gray-600/20 text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "getting-started": return <Play className="w-4 h-4" />;
      case "deployment": return <Zap className="w-4 h-4" />;
      case "domains": return <Globe className="w-4 h-4" />;
      case "teams": return <Users className="w-4 h-4" />;
      case "advanced": return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PublicNavbar />
      {/* Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="flame-gradient-text">Guides</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Step-by-step tutorials to help you master GitShip and deploy like a pro
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-dark-700 border-dark-600 text-white placeholder-gray-400 focus:border-neon-orange"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`${
                  selectedCategory === category.id 
                    ? "flame-gradient text-dark-900" 
                    : "border-gray-600 text-white hover:bg-dark-700"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {getCategoryIcon(category.id)}
                <span className="ml-2">{category.name} ({category.count})</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      {selectedCategory === "all" && featuredGuides.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              <span className="flame-gradient-text">Featured</span> Guides
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredGuides.map((guide) => (
                <Card key={guide.id} className="bg-dark-800 border-dark-600 hover:border-neon-orange/50 transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-neon-yellow text-dark-900 font-semibold">Featured</Badge>
                      <Badge className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-neon-orange transition-colors">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{guide.readTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{guide.author}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:text-neon-orange transition-colors" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {guide.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-dark-600 text-gray-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Guides */}
      <section className="py-16 px-6 bg-dark-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">
            {selectedCategory === "all" ? "All" : categories.find(c => c.id === selectedCategory)?.name} <span className="flame-gradient-text">Guides</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Card key={guide.id} className="bg-dark-700 border-dark-600 hover:border-neon-orange/50 transition-all group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(guide.category)}
                      <span className="text-xs text-gray-400 capitalize">{guide.category.replace('-', ' ')}</span>
                    </div>
                    <Badge className={getDifficultyColor(guide.difficulty) + " text-xs"}>
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-neon-orange transition-colors line-clamp-2">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm line-clamp-2">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{guide.readTime}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:text-neon-orange transition-colors" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {guide.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-dark-600 text-gray-300 text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {guide.tags.length > 2 && (
                      <Badge variant="secondary" className="bg-dark-600 text-gray-300 text-xs px-2 py-0">
                        +{guide.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Need help with something <span className="flame-gradient-text">specific</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Can't find the guide you're looking for? Reach out to our community or support team
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="flame-gradient text-dark-900 font-semibold">
              <Users className="w-4 h-4 mr-2" />
              Join Community
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Request Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}