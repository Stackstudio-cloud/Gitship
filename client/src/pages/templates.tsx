import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Star,
  GitFork,
  ExternalLink,
  Zap,
  Globe,
  Smartphone,
  Code,
  Palette,
  ShoppingCart,
  BookOpen,
  Briefcase,
  User,
  Heart
} from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/components/public-navbar";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Templates", count: 24 },
    { id: "react", name: "React", count: 8 },
    { id: "vue", name: "Vue.js", count: 6 },
    { id: "next", name: "Next.js", count: 5 },
    { id: "static", name: "Static", count: 3 },
    { id: "e-commerce", name: "E-commerce", count: 2 }
  ];

  const templates = [
    {
      id: 1,
      name: "Modern Portfolio",
      description: "Clean, professional portfolio template with dark theme and animations",
      category: "react",
      framework: "React",
      stars: 1247,
      forks: 312,
      image: "/api/placeholder/400/250",
      tags: ["Portfolio", "Dark Theme", "Animations", "TypeScript"],
      demoUrl: "#",
      repoUrl: "#",
      featured: true
    },
    {
      id: 2,
      name: "SaaS Landing Page",
      description: "Complete SaaS landing page with pricing, features, and testimonials",
      category: "next",
      framework: "Next.js",
      stars: 892,
      forks: 203,
      image: "/api/placeholder/400/250",
      tags: ["SaaS", "Landing", "Pricing", "Tailwind"],
      demoUrl: "#",
      repoUrl: "#",
      featured: true
    },
    {
      id: 3,
      name: "E-commerce Store",
      description: "Full-featured e-commerce template with cart, checkout, and admin",
      category: "e-commerce",
      framework: "React",
      stars: 2156,
      forks: 567,
      image: "/api/placeholder/400/250",
      tags: ["E-commerce", "Shopping Cart", "Stripe", "Admin"],
      demoUrl: "#",
      repoUrl: "#",
      featured: true
    },
    {
      id: 4,
      name: "Blog Template",
      description: "Minimalist blog template with markdown support and SEO optimization",
      category: "static",
      framework: "Gatsby",
      stars: 634,
      forks: 156,
      image: "/api/placeholder/400/250",
      tags: ["Blog", "Markdown", "SEO", "Minimalist"],
      demoUrl: "#",
      repoUrl: "#"
    },
    {
      id: 5,
      name: "Dashboard Admin",
      description: "Complete admin dashboard with charts, tables, and user management",
      category: "vue",
      framework: "Vue.js",
      stars: 1543,
      forks: 421,
      image: "/api/placeholder/400/250",
      tags: ["Dashboard", "Admin", "Charts", "Tables"],
      demoUrl: "#",
      repoUrl: "#"
    },
    {
      id: 6,
      name: "Agency Website",
      description: "Modern agency website with team profiles and project showcases",
      category: "react",
      framework: "React",
      stars: 789,
      forks: 234,
      image: "/api/placeholder/400/250",
      tags: ["Agency", "Team", "Projects", "Modern"],
      demoUrl: "#",
      repoUrl: "#"
    }
  ];

  const featuredTemplates = templates.filter(t => t.featured);
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case "React": return <Code className="w-4 h-4" />;
      case "Vue.js": return <Palette className="w-4 h-4" />;
      case "Next.js": return <Zap className="w-4 h-4" />;
      case "Gatsby": return <BookOpen className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PublicNavbar />
      {/* Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="flame-gradient-text">Templates</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Deploy faster with our collection of professionally designed templates. 
            One-click deployment for instant results.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
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
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      {selectedCategory === "all" && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              <span className="flame-gradient-text">Featured</span> Templates
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredTemplates.map((template) => (
                <Card key={template.id} className="bg-dark-800 border-dark-600 hover:border-neon-orange/50 transition-all group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="w-full h-48 bg-gradient-to-br from-neon-orange/20 to-neon-red/20 flex items-center justify-center">
                      <Globe className="w-16 h-16 text-neon-orange/60" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-neon-yellow text-dark-900 font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-white group-hover:text-neon-orange transition-colors">
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        {getFrameworkIcon(template.framework)}
                        <span>{template.framework}</span>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{template.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="w-4 h-4" />
                          <span>{template.forks}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-dark-600 text-gray-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1 flame-gradient text-dark-900 font-semibold">
                        <Zap className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-dark-700">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Templates */}
      <section className="py-16 px-6 bg-dark-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">
            All <span className="flame-gradient-text">Templates</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-dark-700 border-dark-600 hover:border-neon-orange/50 transition-all group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Globe className="w-12 h-12 text-gray-600" />
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-white text-lg group-hover:text-neon-orange transition-colors">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      {getFrameworkIcon(template.framework)}
                    </div>
                  </div>
                  <CardDescription className="text-gray-400 text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{template.stars}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="w-3 h-3" />
                        <span>{template.forks}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-dark-600 text-gray-300 text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 2 && (
                      <Badge variant="secondary" className="bg-dark-600 text-gray-300 text-xs px-2 py-0">
                        +{template.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <Button className="w-full flame-gradient text-dark-900 font-semibold text-sm">
                    <Zap className="w-3 h-3 mr-2" />
                    Deploy Template
                  </Button>
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
            Can't find what you're <span className="flame-gradient-text">looking for</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Request a custom template or contribute your own to our growing collection
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="flame-gradient text-dark-900 font-semibold">
              <Heart className="w-4 h-4 mr-2" />
              Request Template
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              <Code className="w-4 h-4 mr-2" />
              Submit Template
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}