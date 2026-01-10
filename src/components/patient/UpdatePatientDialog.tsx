"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { patientService } from "../../services/patient.service";
import { Patient } from "../../interfaces/patient.interface";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdatePatientFormValues {
  name: string;
  last_name: string;
  middle_name?: string;
  phone_number: string;
  gender: "e" | "a";
}

interface UpdatePatientDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function UpdatePatientDialog({
  patient,
  isOpen,
  onOpenChange,
  onSuccess,
}: UpdatePatientDialogProps) {
  const form = useForm<UpdatePatientFormValues>({
    defaultValues: {
      name: "",
      last_name: "",
      middle_name: "",
      phone_number: "",
      gender: undefined, // Will be set by useEffect
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        last_name: patient.last_name,
        middle_name: patient.middle_name || "",
        phone_number: patient.phone_number,
        gender: patient.gender as "e" | "a", // Cast to the correct type
      });
    }
  }, [patient, form]);

  const onSubmit = async (values: UpdatePatientFormValues) => {
    if (!patient) return;

    let hasError = false;
    if (!values.name) {
      form.setError("name", { type: "manual", message: "Ism majburiy" });
      hasError = true;
    }
    if (!values.last_name) {
      form.setError("last_name", { type: "manual", message: "Familiya majburiy" });
      hasError = true;
    }
    if (!values.phone_number) {
      form.setError("phone_number", { type: "manual", message: "Telefon raqami majburiy" });
      hasError = true;
    }
    if (!values.gender) {
      form.setError("gender", { type: "manual", message: "Jinsni tanlang" });
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await patientService.updatePatientById(patient.id, values);
      toast.success("Bemor ma'lumotlari muvaffaqiyatli yangilandi");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update patient:", error);
      toast.error("Bemor ma'lumotlarini yangilashda xatolik yuz berdi");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bemor ma'lumotlarini tahrirlash</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism</FormLabel>
                  <FormControl>
                    <Input placeholder="Bemorning ismi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Familiya</FormLabel>
                  <FormControl>
                    <Input placeholder="Bemorning familiyasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Otasining ismi</FormLabel>
                  <FormControl>
                    <Input placeholder="Bemorning otasining ismi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon raqami</FormLabel>
                  <FormControl>
                    <Input placeholder="+998 XX XXX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jinsi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Jinsini tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="e">Erkak</SelectItem>
                      <SelectItem value="a">Ayol</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
