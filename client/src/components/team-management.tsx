import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Crown, Shield, User, Mail, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
}

interface TeamManagementProps {
  projectId: number;
}

export default function TeamManagement({ projectId }: TeamManagementProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("developer");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "team"],
    enabled: !!projectId,
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest(`/api/projects/${projectId}/team/invite`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Team invitation has been sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "team"] });
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("developer");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest(`/api/projects/${projectId}/team/${memberId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "team"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { memberId: string; role: string }) => {
      return await apiRequest(`/api/projects/${projectId}/team/${data.memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: data.role }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "team"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'developer': return <User className="w-4 h-4" />;
      case 'viewer': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'admin': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'developer': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
      case 'viewer': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-800 border-dark-600">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-600 rounded"></div>
              <div className="h-12 bg-gray-600 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-neon-purple" />
            <div>
              <CardTitle className="text-white">Team Members</CardTitle>
              <CardDescription className="text-gray-400">
                Manage who has access to this project
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon-green text-dark-900 hover:bg-neon-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-800 border-dark-600 text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Send an invitation to collaborate on this project.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-dark-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role" className="text-white">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="bg-dark-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-700 border-gray-600">
                      <SelectItem value="viewer">Viewer - Can view deployments</SelectItem>
                      <SelectItem value="developer">Developer - Can deploy and manage</SelectItem>
                      <SelectItem value="admin">Admin - Full project access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    className="border-gray-600 text-white hover:bg-dark-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail || inviteMemberMutation.isPending}
                    className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
                  >
                    {inviteMemberMutation.isPending ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No team members yet</p>
            <p className="text-sm">Invite teammates to collaborate on this project</p>
          </div>
        ) : (
          teamMembers.map((member: TeamMember) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-700 border border-dark-600">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.profileImageUrl} />
                  <AvatarFallback className="bg-dark-600 text-white">
                    {member.firstName?.[0] || member.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {member.firstName && member.lastName 
                        ? `${member.firstName} ${member.lastName}`
                        : member.email
                      }
                    </span>
                    <Badge variant="outline" className={getRoleColor(member.role)}>
                      <span className="mr-1">{getRoleIcon(member.role)}</span>
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>
              
              {member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-dark-700 border-dark-600">
                    <DropdownMenuItem 
                      onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'admin' })}
                      className="text-white hover:bg-dark-600"
                    >
                      Change to Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'developer' })}
                      className="text-white hover:bg-dark-600"
                    >
                      Change to Developer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'viewer' })}
                      className="text-white hover:bg-dark-600"
                    >
                      Change to Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      className="text-red-400 hover:bg-dark-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}