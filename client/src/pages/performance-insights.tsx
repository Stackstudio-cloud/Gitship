import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  Globe,
  Image,
  Code,
  Smartphone,
  Monitor,
  Wifi,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";

export default function PerformanceInsightsPage() {
  const performanceMetrics = [
    {
      title: "Core Web Vitals",
      score: 92,
      status: "excellent",
      details: [
        { metric: "Largest Contentful Paint", value: "1.2s", status: "good", target: "<2.5s" },
        { metric: "First Input Delay", value: "45ms", status: "good", target: "<100ms" },
        { metric: "Cumulative Layout Shift", value: "0.08", status: "good", target: "<0.1" }
      ]
    },
    {
      title: "Loading Performance",
      score: 87,
      status: "good",
      details: [
        { metric: "Time to First Byte", value: "180ms", status: "excellent", target: "<600ms" },
        { metric: "First Contentful Paint", value: "1.8s", status: "good", target: "<1.8s" },
        { metric: "Speed Index", value: "2.1s", status: "good", target: "<3.4s" }
      ]
    },
    {
      title: "Resource Efficiency",
      score: 74,
      status: "needs-improvement",
      details: [
        { metric: "Bundle Size", value: "2.1MB", status: "warning", target: "<1.5MB" },
        { metric: "Image Optimization", value: "68%", status: "warning", target: ">90%" },
        { metric: "Cache Hit Rate", value: "94%", status: "excellent", target: ">90%" }
      ]
    }
  ];

  const optimizationOpportunities = [
    {
      title: "Compress Images",
      impact: "High",
      savings: "1.2s load time reduction",
      description: "Convert 24 PNG images to WebP format and enable compression",
      effort: "Low",
      icon: Image,
      automated: true
    },
    {
      title: "Enable Tree Shaking",
      impact: "High",
      savings: "340KB bundle size reduction",
      description: "Remove unused JavaScript from lodash and moment.js libraries",
      effort: "Medium",
      icon: Code,
      automated: true
    },
    {
      title: "Implement Code Splitting",
      impact: "Medium",
      savings: "0.8s faster first paint",
      description: "Split large bundles into smaller chunks for better caching",
      effort: "Medium",
      icon: Zap,
      automated: false
    },
    {
      title: "Optimize Font Loading",
      impact: "Medium",
      savings: "0.3s layout shift reduction",
      description: "Preload critical fonts and use font-display: swap",
      effort: "Low",
      icon: Globe,
      automated: true
    }
  ];

  const devicePerformance = [
    { device: "Desktop", score: 94, change: +3, color: "neon-green" },
    { device: "Mobile", score: 78, change: +8, color: "neon-yellow" },
    { device: "Tablet", score: 86, change: -2, color: "neon-orange" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-neon-yellow";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-600/20";
    if (score >= 75) return "bg-neon-yellow/20";
    return "bg-red-600/20";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-neon-red/20 text-neon-red";
      case "Medium": return "bg-neon-orange/20 text-neon-orange";
      case "Low": return "bg-neon-yellow/20 text-neon-yellow";
      default: return "bg-gray-600/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": case "good": return "text-green-400";
      case "warning": return "text-neon-yellow";
      case "poor": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PublicNavbar />
      {/* Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-neon-orange to-neon-red rounded-full mb-6">
            <Activity className="w-10 h-10 text-dark-900" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Performance <span className="flame-gradient-text">Insights</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Real-time performance monitoring, automated optimizations, and actionable insights 
            to make your sites blazingly fast across all devices and networks.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="flame-gradient text-dark-900 font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Report
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              <Zap className="w-4 h-4 mr-2" />
              Auto-Optimize
            </Button>
          </div>
        </div>
      </section>

      {/* Performance Overview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Performance <span className="flame-gradient-text">Overview</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-white">{metric.title}</CardTitle>
                    <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}
                    </div>
                  </div>
                  <Progress 
                    value={metric.score} 
                    className="h-2 bg-dark-600"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metric.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{detail.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className={getStatusColor(detail.status)}>{detail.value}</span>
                          <span className="text-gray-500">({detail.target})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Device Performance */}
          <div className="grid md:grid-cols-3 gap-6">
            {devicePerformance.map((device, index) => (
              <Card key={index} className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {device.device === "Desktop" && <Monitor className="w-5 h-5 text-neon-orange" />}
                      {device.device === "Mobile" && <Smartphone className="w-5 h-5 text-neon-orange" />}
                      {device.device === "Tablet" && <Monitor className="w-5 h-5 text-neon-orange" />}
                      <CardTitle className="text-white">{device.device}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(device.score)}`}>
                        {device.score}
                      </div>
                      <div className={`text-sm flex items-center ${device.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {device.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(device.change)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Optimization Opportunities */}
      <section className="py-16 px-6 bg-dark-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Optimization <span className="flame-gradient-text">Opportunities</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {optimizationOpportunities.map((opportunity, index) => (
              <Card key={index} className="bg-dark-700 border-dark-600 hover:border-neon-orange/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neon-orange/20 rounded-lg flex items-center justify-center">
                        <opportunity.icon className="w-5 h-5 text-neon-orange" />
                      </div>
                      <div>
                        <CardTitle className="text-white flex items-center">
                          {opportunity.title}
                          {opportunity.automated && (
                            <Badge className="ml-2 bg-neon-yellow/20 text-neon-yellow text-xs">
                              Auto-fix
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getImpactColor(opportunity.impact)}>
                            {opportunity.impact} Impact
                          </Badge>
                          <span className="text-sm text-gray-400">• {opportunity.effort} effort</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400 mb-4">
                    {opportunity.description}
                  </CardDescription>
                  <div className="text-sm font-medium text-neon-orange mb-4">
                    💡 {opportunity.savings}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {opportunity.automated ? (
                      <Button className="flame-gradient text-dark-900 font-semibold">
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-Apply
                      </Button>
                    ) : (
                      <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
                        <Code className="w-4 h-4 mr-2" />
                        View Guide
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Monitoring */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Real-time <span className="flame-gradient-text">Monitoring</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-neon-orange" />
                    <span className="text-sm text-gray-400">Response Time</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">127ms</div>
                <div className="text-xs text-green-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  15% faster than average
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-neon-orange" />
                    <span className="text-sm text-gray-400">Uptime</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">99.97%</div>
                <div className="text-xs text-gray-400">Last 30 days</div>
              </CardHeader>
            </Card>

            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-neon-orange" />
                    <span className="text-sm text-gray-400">Throughput</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">2.3K</div>
                <div className="text-xs text-gray-400">Requests/minute</div>
              </CardHeader>
            </Card>

            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-neon-yellow" />
                    <span className="text-sm text-gray-400">Errors</span>
                  </div>
                  <span className="text-xs text-neon-yellow">0.2%</span>
                </div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-gray-400">Last 24 hours</div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Optimize your site's <span className="flame-gradient-text">performance</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get detailed insights, automated optimizations, and real-time monitoring for all your deployments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="flame-gradient text-dark-900 font-semibold">
              <Activity className="w-4 h-4 mr-2" />
              Enable Monitoring
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-700">
              <Target className="w-4 h-4 mr-2" />
              Schedule Audit
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}