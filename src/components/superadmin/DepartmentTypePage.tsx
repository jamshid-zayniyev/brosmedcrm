import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { departmentTypeService } from "@/services/department-type.service";
import { departmentService } from "@/services/department.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "../ui/skeleton";

interface DepartmentType {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
  department: number;
  price: number;
  department_title?: string;
}

interface Department {
  id: number;
  title: string;
}

export function DepartmentTypePage() {
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartmentType, setEditingDepartmentType] =
    useState<DepartmentType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    title_uz: "",
    title_ru: "",
    department: 0,
    price: 0,
  });

  useEffect(() => {
    fetchDepartmentTypes();
    fetchDepartments();
  }, []);

  const fetchDepartmentTypes = async () => {
    setIsLoading(true);
    try {
      const data = await departmentTypeService.findAll();
      setDepartmentTypes(data);
    } catch (error) {
      toast.error("Bo'lim turlarini yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.findAll();
      setDepartments(data);
    } catch (error) {
      toast.error("Bo'limlarni yuklashda xatolik yuz berdi");
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, department: parseInt(value) }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_uz: "",
      title_ru: "",
      department: 0,
      price: 0,
    });
    setEditingDepartmentType(null);
  };

  const handleModalOpen = (departmentType: DepartmentType | null = null) => {
    if (departmentType) {
      setEditingDepartmentType(departmentType);
      setFormData({
        title: departmentType.title,
        title_uz: departmentType.title_uz,
        title_ru: departmentType.title_ru,
        department: departmentType.department,
        price: departmentType.price,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDepartmentType) {
        await departmentTypeService.update({
          id: editingDepartmentType.id,
          ...formData,
        });
        toast.success("Bo'lim turi muvaffaqiyatli yangilandi");
      } else {
        await departmentTypeService.create(formData);
        toast.success("Yangi bo'lim turi muvaffaqiyatli qo'shildi");
      }
      fetchDepartmentTypes();
      handleModalClose();
    } catch (error) {
      toast.error("Jarayonda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Haqiqatan ham bu bo'lim turini o'chirmoqchimisiz?")) {
      try {
        await departmentTypeService.delete(id);
        toast.success("Bo'lim turi muvaffaqiyatli o'chirildi");
        fetchDepartmentTypes();
      } catch (error) {
        toast.error("Bo'lim turini o'chirishda xatolik yuz berdi");
      }
    }
  };

  const getDepartmentTitle = (departmentId: number) => {
    return departments.find((d) => d.id === departmentId)?.title || "Noma'lum";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Bo'lim turlari</h1>
          <p className="text-muted-foreground">
            Klinika bo'lim turlarini boshqarish
          </p>
        </div>
        <Button onClick={() => handleModalOpen()}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi bo'lim turi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bo'lim turlari ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nomi (O'zb)</TableHead>
                <TableHead>Nomi (Rus)</TableHead>
                <TableHead>Nomi (Eng)</TableHead>
                <TableHead>Bo'lim</TableHead>
                <TableHead>Narx</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : departmentTypes.map((deptType) => (
                    <TableRow key={deptType.id}>
                      <TableCell>{deptType.id}</TableCell>
                      <TableCell>{deptType.title_uz}</TableCell>
                      <TableCell>{deptType.title_ru}</TableCell>
                      <TableCell>{deptType.title}</TableCell>
                      <TableCell>
                        {deptType.department_title ||
                          getDepartmentTitle(deptType.department)}
                      </TableCell>
                      <TableCell>{deptType.price}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleModalOpen(deptType)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(deptType.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartmentType
                ? "Bo'lim turini tahrirlash"
                : "Yangi bo'lim turi qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Bo'lim</Label>
              <Select
                value={formData.department?.toString()}
                onValueChange={handleSelectChange}
                required
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
            <div className="space-y-2">
              <Label htmlFor="title_uz">Nomi (O'zbekcha)</Label>
              <Input
                id="title_uz"
                name="title_uz"
                value={formData.title_uz}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ru">Nomi (Ruscha)</Label>
              <Input
                id="title_ru"
                name="title_ru"
                value={formData.title_ru}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Nomi (Inglizcha)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Narx</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
