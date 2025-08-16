import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, Shield, Settings, Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "manager" | "cashier";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export function UserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "cashier" as const,
    password: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been successfully created.",
      });
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        role: "cashier",
        password: "",
      });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUser);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "cashier":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "admin":
        return ["Full system access", "User management", "Reports", "Settings"];
      case "manager":
        return ["Inventory management", "Sales reports", "Customer management"];
      case "cashier":
        return ["POS operations", "Customer lookup", "Basic inventory view"];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} data-testid="button-add-user">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@supermarket.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-user-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  data-testid="input-user-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  data-testid="input-user-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  data-testid="input-user-lastname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as any }))}>
                <SelectTrigger data-testid="select-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                <strong>Permissions:</strong> {getRolePermissions(newUser.role).join(", ")}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} data-testid="button-create-user">
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            System Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email}
                      </p>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                      {user.lastLogin && ` • Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserStatusMutation.mutate({
                      userId: user.id,
                      isActive: !user.isActive
                    })}
                    disabled={toggleUserStatusMutation.isPending}
                    data-testid={`button-toggle-user-${user.id}`}
                  >
                    {user.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button size="sm" variant="outline" data-testid={`button-edit-user-${user.id}`}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: "admin", color: "border-red-200 bg-red-50" },
              { role: "manager", color: "border-blue-200 bg-blue-50" },
              { role: "cashier", color: "border-green-200 bg-green-50" },
            ].map(({ role, color }) => (
              <div key={role} className={`p-4 border rounded-lg ${color}`}>
                <h4 className="font-medium capitalize mb-2">{role}</h4>
                <ul className="text-sm space-y-1">
                  {getRolePermissions(role).map((permission, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1 h-1 bg-current rounded-full mr-2"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}