import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-dark-800 border-b border-dark-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="/gitship-logo-transparent.png" 
              alt="GitShip Logo" 
              className="h-12 w-auto"
            />
          </a>
          <div className="hidden md:flex items-center space-x-6 ml-8">
            <a href="/" className="text-neon-orange hover:text-neon-yellow transition-colors">Sites</a>
            <a href="/templates" className="text-gray-400 hover:text-neon-orange transition-colors">Templates</a>
            <a href="/ai-copilot" className="text-gray-400 hover:text-neon-orange transition-colors">AI Copilot</a>
            <a href="/performance" className="text-gray-400 hover:text-neon-orange transition-colors">Performance</a>
            <a href="/guides" className="text-gray-400 hover:text-neon-orange transition-colors">Guides</a>
            <a href="/docs" className="text-gray-400 hover:text-neon-orange transition-colors">Docs</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-neon-orange">
            <Bell className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-dark-700">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border border-neon-orange"
                  />
                  <span className="text-sm font-medium hidden md:block">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'
                    }
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark-800 border-dark-600">
              <DropdownMenuItem className="hover:bg-dark-700 focus:bg-dark-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-dark-700 focus:bg-dark-700 text-red-400"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
