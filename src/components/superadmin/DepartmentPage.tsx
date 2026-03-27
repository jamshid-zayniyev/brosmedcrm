import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { departmentService } from "../../services/department.service";
import { useReferenceDataStore } from "../../stores/reference-data.store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";

interface Department {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
}

export function DepartmentPage() {
  const departments = useReferenceDataStore(
    (state) => state.departments as Department[]
  );
  const departmentsLoaded = useReferenceDataStore(
    (state) => state.departmentsLoaded
  );
  const fetchDepartments = useReferenceDataStore((state) => state.fetchDepartments);
  const [isLoading, setIsLoading] = useState(!departmentsLoaded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    title_uz: "",
    title_ru: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      if (departmentsLoaded) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await fetchDepartments();
      } catch (error) {
        toast.error("Bo'limlarni yuklashda xatolik yuz berdi !");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, [departmentsLoaded, fetchDepartments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: "", title_uz: "", title_ru: "" });
    setEditingDepartment(null);
  };

  const handleModalOpen = (department: Department | null = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        title: department.title,
        title_uz: department.title_uz,
        title_ru: department.title_ru,
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
      if (editingDepartment) {
        await departmentService.update({
          id: editingDepartment.id,
          ...formData,
        });
        toast.success("Bo'lim muvaffaqiyatli yangilandi");
      } else {
        await departmentService.create(formData);
        toast.success("Yangi bo'lim muvaffaqiyatli qo'shildi");
      }
      setIsLoading(true);
      await fetchDepartments(true);
      handleModalClose();
    } catch (error) {
      toast.error("Jarayonda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Haqiqatan ham bu bo'limni o'chirmoqchimisiz?")) {
      try {
        await departmentService.delete(id);
        toast.success("Bo'lim muvaffaqiyatli o'chirildi");
        setIsLoading(true);
        await fetchDepartments(true);
      } catch (error) {
        toast.error("Bo'limni o'chirishda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Bo'limlar</h1>
          <p className="text-muted-foreground">
            Klinika bo'limlarini boshqarish
          </p>
        </div>
        <Button onClick={() => handleModalOpen()}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi bo'lim
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bo'limlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nomi (O'zb)</TableHead>
                <TableHead>Nomi (Rus)</TableHead>
                <TableHead>Nomi (Eng)</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.id}</TableCell>
                      <TableCell>{dept.title_uz}</TableCell>
                      <TableCell>{dept.title_ru}</TableCell>
                      <TableCell>{dept.title}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleModalOpen(dept)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dept.id)}
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
        <DialogContent
          style={{
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingDepartment
                ? "Bo'limni tahrirlash"
                : "Yangi bo'lim qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
