import { useState } from 'react';
import { AppContextType } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { UserPlus, Edit, Trash2, Shield, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserManagementProps {
  context: AppContextType;
}

interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  role: 'superadmin' | 'reception' | 'laboratory' | 'doctor';
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function UserManagement({ context }: UserManagementProps) {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: '1',
      username: 'admin',
      fullName: 'Superadmin',
      role: 'superadmin',
      email: 'admin@klinika.uz',
      phone: '+998901234567',
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      username: 'reception',
      fullName: 'Qabul xonasi',
      role: 'reception',
      email: 'reception@klinika.uz',
      phone: '+998901234568',
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      username: 'lab',
      fullName: 'Laboratoriya',
      role: 'laboratory',
      email: 'lab@klinika.uz',
      phone: '+998901234569',
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: '4',
      username: 'doctor',
      fullName: 'Dr. Alisher Aliyev',
      role: 'doctor',
      email: 'aliyev@klinika.uz',
      phone: '+998901234570',
      status: 'active',
      createdAt: '2024-01-01',
    },
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'doctor' as 'superadmin' | 'reception' | 'laboratory' | 'doctor',
    email: '',
    phone: '',
    password: '',
  });

  const handleAddUser = () => {
    const newUser: SystemUser = {
      id: `u${Date.now()}`,
      username: formData.username,
      fullName: formData.fullName,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    toast.success('Yangi foydalanuvchi qo\'shildi');
    setIsAddingUser(false);
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...formData }
        : u
    ));
    toast.success('Foydalanuvchi yangilandi');
    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('Foydalanuvchi o\'chirildi');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : u
    ));
    toast.success('Status o\'zgartirildi');
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      role: 'doctor',
      email: '',
      phone: '',
      password: '',
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      'superadmin': { label: 'Superadmin', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      'reception': { label: 'Qabul', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'laboratory': { label: 'Laboratoriya', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'doctor': { label: 'Shifokor', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    return roleConfig[role] || roleConfig['doctor'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Foydalanuvchilar boshqaruvi</h1>
          <p className="text-muted-foreground">
            Jami foydalanuvchilar: {users.length} ta
          </p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Yangi foydalanuvchi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi foydalanuvchi qo'shish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Foydalanuvchi nomi *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">To'liq ismi *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                    <SelectItem value="reception">Qabul</SelectItem>
                    <SelectItem value="laboratory">Laboratoriya</SelectItem>
                    <SelectItem value="doctor">Shifokor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddUser} className="flex-1">
                  Qo'shish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingUser(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {user.role === 'superadmin' ? (
                      <Shield className="w-6 h-6 text-primary" />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h3>{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getRoleBadge(user.role).className}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                      >
                        {user.status === 'active' ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Email: <span className="text-foreground">{user.email}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Telefon: <span className="text-foreground">{user.phone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Dialog
                    open={editingUser?.id === user.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingUser(null);
                        resetForm();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            username: user.username,
                            fullName: user.fullName,
                            role: user.role,
                            email: user.email,
                            phone: user.phone,
                            password: '',
                          });
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Tahrirlash
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-fullName">To'liq ismi *</Label>
                          <Input
                            id="edit-fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email *</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Telefon *</Label>
                          <Input
                            id="edit-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleUpdateUser} className="flex-1">
                            Saqlash
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingUser(null);
                              resetForm();
                            }}
                            className="flex-1"
                          >
                            Bekor qilish
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.status === 'active' ? 'Nofaol qilish' : 'Faollashtirish'}
                  </Button>

                  {user.role !== 'superadmin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      O'chirish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
