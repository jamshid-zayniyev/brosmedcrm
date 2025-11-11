import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserPlus, Edit, Trash2, Shield, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { departmentService } from "../../services/department.service";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import { useUserStore } from "@/stores/user.store";

interface SystemUser {
  id: string;
  username: string;
  full_name: string | null;
  role: "s" | "r" | "l" | "d" | "c";
  phone_number: string;
  is_active: boolean;
  department: string | null;
  price: number;
  passport: string | null;
}

interface Department {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
  department_types: {
    id: number;
    title: string;
    title_uz: string;
    title_ru: string;
  };
}

export function UserManagement() {
  const { user: currentUser } = useUserStore();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    department: 0,
    full_name: "",
    username: "",
    phone_number: "",
    password: "",
    role: "d" as "s" | "r" | "l" | "d" | "c",
    is_active: true,
    price: 0,
    passport: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await authService.findUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Foydalanuvchilarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.findAll();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUser = async () => {
    setIsSubmitting(true);
    try {
      await authService.createUser(formData);
      toast.success("Yangi foydalanuvchi qo'shildi");
      fetchUsers();
      setIsAddingUser(false);
      resetForm();
    } catch (error) {
      toast.error("Foydalanuvchi qo'shishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        id: parseInt(editingUser.id),
        full_name: formData.full_name,
        username: formData.username,
        phone_number: formData.phone_number,
        price: formData.price,
        passport: formData.passport,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (currentUser?.id !== editingUser.id) {
        payload.role = formData.role;
        payload.department = formData.department;
        payload.is_active = formData.is_active;
      }

      await authService.update(payload);
      toast.success("Foydalanuvchi muvaffaqiyatli yangilandi");
      fetchUsers();
      setEditingUser(null);
      resetForm();
    } catch (error) {
      toast.error("Foydalanuvchini yangilashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?")) {
      try {
        await authService.delete(parseInt(userId));
        toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
        fetchUsers();
      } catch (error) {
        toast.error("Foydalanuvchini o'chirishda xatolik yuz berdi");
      }
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    setTogglingStatusId(user.id);
    try {
      await authService.update({
        id: parseInt(user.id),
        is_active: !user.is_active,
      });
      toast.success("Foydalanuvchi holati muvaffaqiyatli o'zgartirildi");
      fetchUsers();
    } catch (error) {
      toast.error("Foydalanuvchi holatini o'zgartirishda xatolik yuz berdi");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      department: 0,
      full_name: "",
      username: "",
      phone_number: "",
      password: "",
      role: "d",
      is_active: true,
      price: 0,
      passport: "",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      s: {
        label: "Superadmin",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      r: {
        label: "Qabul",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      l: {
        label: "Laboratoriya",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
      d: {
        label: "Shifokor",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      c: {
        label: "Kassir",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
    };
    return roleConfig[role] || roleConfig["d"];
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Foydalanuvchi nomi *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">To'liq ismi *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefon *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Parol *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Narx *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value),
                      })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport">Pasport seriyasi va raqami *</Label>
                  <Input
                    id="passport"
                    value={formData.passport}
                    onChange={(e) =>
                      setFormData({ ...formData, passport: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s">Superadmin</SelectItem>
                      <SelectItem value="r">Qabul</SelectItem>
                      <SelectItem value="l">Laboratoriya</SelectItem>
                      <SelectItem value="d">Shifokor</SelectItem>
                      <SelectItem value="c">Kassir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Bo'lim</Label>
                  <Select
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, department: parseInt(value) })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bo'limni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="is_active">Faol</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddUser}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Qo'shish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingUser(false);
                    resetForm();
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
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
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {user.role === "s" ? (
                          <Shield className="w-6 h-6 text-primary" />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h3>{user.full_name || "Noma'lum"}</h3>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRoleBadge(user.role).className}>
                            {getRoleBadge(user.role).label}
                          </Badge>
                          <Badge
                            variant={user.is_active ? "default" : "secondary"}
                          >
                            {user.is_active ? "Faol" : "Nofaol"}
                          </Badge>
                        </div>

                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Telefon:{" "}
                            <span className="text-foreground">
                              {user.phone_number}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Narx:{" "}
                            <span className="text-foreground">
                              {user.price}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Pasport:{" "}
                            <span className="text-foreground">
                              {user.passport}
                            </span>
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
                                full_name: user.full_name || "",
                                role: user.role,
                                phone_number: user.phone_number,
                                password: "",
                                department:
                                  departments.find(
                                    (d) => d.title === user.department
                                  )?.id || 0,
                                is_active: user.is_active,
                                price: user.price,
                                passport: user.passport || "",
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Tahrirlash
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Foydalanuvchini tahrirlash
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-username">
                                  Foydalanuvchi nomi *
                                </Label>
                                <Input
                                  id="edit-username"
                                  value={formData.username}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      username: e.target.value,
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-fullName">
                                  To'liq ismi *
                                </Label>
                                <Input
                                  id="edit-fullName"
                                  value={formData.full_name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      full_name: e.target.value,
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefon *</Label>
                                <Input
                                  id="edit-phone"
                                  type="tel"
                                  value={formData.phone_number}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      phone_number: e.target.value,
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-password">
                                  Yangi parol (bo'sh qoldiring o'zgartirmaslik
                                  uchun)
                                </Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  value={formData.password}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      password: e.target.value,
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="price">Narx *</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price: parseInt(e.target.value),
                                    })
                                  }
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-passport">
                                  Pasport seriyasi va raqami *
                                </Label>
                                <Input
                                  id="edit-passport"
                                  value={formData.passport}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      passport: e.target.value,
                                    })
                                  }
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>

                              {currentUser?.id !== user.id && (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor="role">Rol *</Label>
                                    <Select
                                      value={formData.role}
                                      onValueChange={(value: any) =>
                                        setFormData({
                                          ...formData,
                                          role: value,
                                        })
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="s">
                                          Superadmin
                                        </SelectItem>
                                        <SelectItem value="r">Qabul</SelectItem>
                                        <SelectItem value="l">
                                          Laboratoriya
                                        </SelectItem>
                                        <SelectItem value="d">
                                          Shifokor
                                        </SelectItem>
                                        <SelectItem value="c">Kassir</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="department">Bo'lim</Label>
                                    <Select
                                      value={formData.department.toString()}
                                      onValueChange={(value: any) =>
                                        setFormData({
                                          ...formData,
                                          department: parseInt(value),
                                        })
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Bo'limni tanlang" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departments.map((dept) => (
                                          <SelectItem
                                            key={dept.id}
                                            value={dept.id.toString()}
                                          >
                                            {dept.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="is_active"
                                      checked={formData.is_active}
                                      onCheckedChange={(checked: boolean) =>
                                        setFormData({
                                          ...formData,
                                          is_active: checked,
                                        })
                                      }
                                      disabled={isSubmitting}
                                    />
                                    <Label htmlFor="is_active">Faol</Label>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={handleUpdateUser}
                                className="flex-1"
                                disabled={isSubmitting}
                              >
                                {isSubmitting && (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Saqlash
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(null);
                                  resetForm();
                                }}
                                className="flex-1"
                                disabled={isSubmitting}
                              >
                                Bekor qilish
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {currentUser?.id !== user.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingStatusId === user.id}
                          >
                            {togglingStatusId === user.id && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {user.is_active
                              ? "Nofaol qilish"
                              : "Faollashtirish"}
                          </Button>

                          {user.role !== "s" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              O'chirish
                            </Button>
                          )}
                        </>
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
