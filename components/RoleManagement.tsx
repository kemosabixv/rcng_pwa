import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  UserCheck,
  UserX,
  Eye,
  Lock
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
}

interface UserRole {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  permissions: string[];
  status: string;
  lastLogin: string | null;
}

const PERMISSION_CATEGORIES = {
  'member': 'Member Management',
  'event': 'Event Management',
  'project': 'Project Management',
  'financial': 'Financial Management',
  'content': 'Content Management',
  'system': 'System Administration'
};

const DEFAULT_PERMISSIONS = [
  { id: 'member:read', name: 'View Members', description: 'Can view member list and profiles', category: 'member', isSystem: true },
  { id: 'member:write', name: 'Edit Members', description: 'Can edit member information', category: 'member', isSystem: true },
  { id: 'member:delete', name: 'Delete Members', description: 'Can delete member accounts', category: 'member', isSystem: true },
  { id: 'event:read', name: 'View Events', description: 'Can view events and calendar', category: 'event', isSystem: true },
  { id: 'event:write', name: 'Create Events', description: 'Can create and edit events', category: 'event', isSystem: true },
  { id: 'event:delete', name: 'Delete Events', description: 'Can delete events', category: 'event', isSystem: true },
  { id: 'project:read', name: 'View Projects', description: 'Can view project details', category: 'project', isSystem: true },
  { id: 'project:write', name: 'Manage Projects', description: 'Can create and edit projects', category: 'project', isSystem: true },
  { id: 'project:delete', name: 'Delete Projects', description: 'Can delete projects', category: 'project', isSystem: true },
  { id: 'financial:read', name: 'View Financial', description: 'Can view financial reports', category: 'financial', isSystem: true },
  { id: 'financial:write', name: 'Manage Financial', description: 'Can manage dues and payments', category: 'financial', isSystem: true },
  { id: 'content:read', name: 'View Content', description: 'Can view blog posts and content', category: 'content', isSystem: true },
  { id: 'content:write', name: 'Create Content', description: 'Can create and edit content', category: 'content', isSystem: true },
  { id: 'content:delete', name: 'Delete Content', description: 'Can delete content', category: 'content', isSystem: true },
  { id: 'system:admin', name: 'System Admin', description: 'Full system administration access', category: 'system', isSystem: true }
];

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: DEFAULT_PERMISSIONS.map(p => p.id),
    isSystem: true,
    createdAt: new Date().toISOString(),
    userCount: 0
  },
  {
    id: 'officer',
    name: 'Officer',
    description: 'Officer with management permissions',
    permissions: ['member:read', 'member:write', 'event:read', 'event:write', 'project:read', 'project:write', 'content:read', 'content:write', 'financial:read'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    userCount: 0
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Basic member with limited permissions',
    permissions: ['member:read', 'event:read', 'project:read', 'content:read'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    userCount: 0
  }
];

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New role form
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Edit role form
  const [editRole, setEditRole] = useState({
    id: '',
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    // In a real app, this would load data from the backend
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    // Mock data - in real app, this would be loaded from backend
    const mockUserRoles: UserRole[] = [
      {
        userId: '1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        currentRole: 'admin',
        permissions: DEFAULT_ROLES.find(r => r.id === 'admin')?.permissions || [],
        status: 'active',
        lastLogin: new Date().toISOString()
      },
      {
        userId: '2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        currentRole: 'officer',
        permissions: DEFAULT_ROLES.find(r => r.id === 'officer')?.permissions || [],
        status: 'active',
        lastLogin: new Date().toISOString()
      },
      {
        userId: '3',
        userName: 'Bob Johnson',
        userEmail: 'bob@example.com',
        currentRole: 'member',
        permissions: DEFAULT_ROLES.find(r => r.id === 'member')?.permissions || [],
        status: 'active',
        lastLogin: null
      }
    ];
    setUserRoles(mockUserRoles);
  };

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const roleId = `role_${Date.now()}`;
      const role: Role = {
        id: roleId,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        isSystem: false,
        createdAt: new Date().toISOString(),
        userCount: 0
      };

      setRoles([...roles, role]);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsCreateDialogOpen(false);
      setSuccess('Role created successfully!');
    } catch (err) {
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!editRole.name || !editRole.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatedRoles = roles.map(role =>
        role.id === editRole.id
          ? { ...role, name: editRole.name, description: editRole.description, permissions: editRole.permissions }
          : role
      );

      setRoles(updatedRoles);
      setIsEditDialogOpen(false);
      setSuccess('Role updated successfully!');
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      setError('Cannot delete system roles');
      return;
    }

    if (role?.userCount > 0) {
      setError('Cannot delete role with assigned users');
      return;
    }

    setLoading(true);
    try {
      setRoles(roles.filter(r => r.id !== roleId));
      setSuccess('Role deleted successfully!');
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string, isChecked: boolean, formType: 'new' | 'edit') => {
    if (formType === 'new') {
      setNewRole({
        ...newRole,
        permissions: isChecked
          ? [...newRole.permissions, permissionId]
          : newRole.permissions.filter(p => p !== permissionId)
      });
    } else {
      setEditRole({
        ...editRole,
        permissions: isChecked
          ? [...editRole.permissions, permissionId]
          : editRole.permissions.filter(p => p !== permissionId)
      });
    }
  };

  const handleUserRoleChange = async (userId: string, newRoleId: string) => {
    setLoading(true);
    try {
      const newRole = roles.find(r => r.id === newRoleId);
      if (!newRole) return;

      const updatedUserRoles = userRoles.map(userRole =>
        userRole.userId === userId
          ? { ...userRole, currentRole: newRoleId, permissions: newRole.permissions }
          : userRole
      );

      setUserRoles(updatedUserRoles);
      setSuccess('User role updated successfully!');
    } catch (err) {
      setError('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (role: Role) => {
    setEditRole({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsEditDialogOpen(true);
  };

  const getPermissionsByCategory = (category: string) => {
    return permissions.filter(p => p.category === category);
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'officer': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Role Name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                />
                <Input
                  placeholder="Description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Permissions</h4>
                <div className="space-y-4">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">{categoryName}</h5>
                      <div className="space-y-2">
                        {getPermissionsByCategory(category).map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`new-${permission.id}`}
                              checked={newRole.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(permission.id, checked as boolean, 'new')
                              }
                            />
                            <label 
                              htmlFor={`new-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                            <span className="text-xs text-muted-foreground">
                              {permission.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{role.name}</h4>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {role.permissions.length} permissions
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {role.userCount} users
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.userCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Role Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Role Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole) => {
                  const role = roles.find(r => r.id === userRole.currentRole);
                  return (
                    <TableRow key={userRole.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userRole.userName}</p>
                          <p className="text-sm text-muted-foreground">{userRole.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={userRole.currentRole}
                          onValueChange={(value) => handleUserRoleChange(userRole.userId, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(userRole.status)}>
                          {userRole.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Lock className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Permissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{categoryName}</h4>
                <div className="space-y-1">
                  {getPermissionsByCategory(category).map((permission) => (
                    <div key={permission.id} className="text-sm">
                      <span className="font-medium">{permission.name}</span>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Role Name"
                value={editRole.name}
                onChange={(e) => setEditRole({...editRole, name: e.target.value})}
              />
              <Input
                placeholder="Description"
                value={editRole.description}
                onChange={(e) => setEditRole({...editRole, description: e.target.value})}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Permissions</h4>
              <div className="space-y-4">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">{categoryName}</h5>
                    <div className="space-y-2">
                      {getPermissionsByCategory(category).map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={editRole.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked as boolean, 'edit')
                            }
                          />
                          <label 
                            htmlFor={`edit-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <span className="text-xs text-muted-foreground">
                            {permission.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} disabled={loading}>
                {loading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}