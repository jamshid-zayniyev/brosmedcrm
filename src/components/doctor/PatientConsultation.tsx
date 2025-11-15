import { useState, useEffect, useCallback, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Stethoscope,
  FileText,
  Pill,
  History,
  Edit,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { LabResult } from "../../interfaces/lab.interface";
import { Patient, PatientStatus } from "../../interfaces/patient.interface";
import { patientService } from "../../services/patient.service";
import { useUserStore } from "../../stores/user.store";
import { consultationService } from "../../services/consultation.service";
import { CreateConsultationDto } from "../../interfaces/consultation.dto";

export function PatientConsultation() {
  const { user } = useUserStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data: Patient[] = await patientService.findAllForDoctor();
      setPatients(data);
    } catch (err) {
      setError("Bemorlarni yuklashda xatolik yuz berdi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const [labResults, setLabResults] = useState<LabResult[]>([]);

  const updatePatient = (id: number, data: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [viewingPatient, setViewingPatient] = useState<number | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [detailedPatient, setDetailedPatient] = useState<Patient | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    diagnosis: "",
    diagnosis_uz: "",
    diagnosis_ru: "",
    recommendation: "",
    recommendation_uz: "",
    recommendation_ru: "",
    recipe: "",
    recipe_uz: "",
    recipe_ru: "",
  });

  const availablePatients = patients.filter(
    (p) =>
      p.patient_status === "r" ||
      p.patient_status === "l" ||
      p.patient_status === "d" ||
      p.patient_status === "t"
  );

  const handleViewPatientHistory = async (patientId: number) => {
    setViewingPatient(patientId);
    setIsHistoryLoading(true);
    setDetailedPatient(null);
    try {
      const data = await patientService.findById(patientId);
      setDetailedPatient(data);
    } catch (error) {
      toast.error("Bemor tarixini yuklashda xatolik yuz berdi.");
      console.error(error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleStartConsultation = async (patientId: number) => {
    setIsSubmitting(true);
    try {
      await patientService.updatePatientStatus({
        id: patientId,
        patient_status: "d",
      });
      toast.success("Konsultatsiya boshlandi");
      setSelectedPatient(patientId.toString());
      await fetchPatients();
    } catch (error) {
      toast.error("Qabulni boshlashda xatolik yuz berdi.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent, finalStatus: "f" | "t" = "f") => {
    e.preventDefault();
    if (!selectedPatient || !user) {
      toast.error("Bemor yoki shifokor tanlanmagan");
      return;
    }

    const {
      diagnosis,
      diagnosis_uz,
      diagnosis_ru,
      recommendation,
      recommendation_uz,
      recommendation_ru,
      recipe,
      recipe_uz,
      recipe_ru,
    } = formData;

    if (
      !diagnosis ||
      !diagnosis_uz ||
      !diagnosis_ru ||
      !recommendation ||
      !recommendation_uz ||
      !recommendation_ru ||
      !recipe ||
      !recipe_uz ||
      !recipe_ru
    ) {
      toast.error("Iltimos, barcha tillardagi maydonlarni to'ldiring.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateConsultationDto = {
        patient: parseInt(selectedPatient, 10),
        patient_status: finalStatus,
        ...formData,
      };

      await consultationService.create(dto);

      toast.success("Konsultatsiya muvaffaqiyatli yaratildi.");

      setFormData({
        diagnosis: "",
        diagnosis_uz: "",
        diagnosis_ru: "",
        recommendation: "",
        recommendation_uz: "",
        recommendation_ru: "",
        recipe: "",
        recipe_uz: "",
        recipe_ru: "",
      });
      setSelectedPatient("");
      await fetchPatients();
    } catch (error) {
      toast.error("Konsultatsiya yaratishda xatolik yuz berdi.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPatientLabResults = (patientId: number) => {
    return labResults.filter((r) => r.patientId === patientId.toString());
  };

  const handleEditPatientStatus = async (
    patientId: number,
    newStatus: PatientStatus
  ) => {
    setIsSubmitting(true);
    try {
      await patientService.updatePatientStatus({
        id: patientId,
        patient_status: newStatus || "f",
      });
      updatePatient(patientId, { patient_status: newStatus });
      toast.success("Bemor statusi muvaffaqiyatli yangilandi.");
      await fetchPatients();
    } catch (error) {
      toast.error("Bemor statusini yangilashda xatolik.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setEditingPatientId(null);
    }
  };

  const getStatusLabel = (status: PatientStatus) => {
    const statusLabels = {
      r: "Ro'yxatdan o'tgan",
      l: "Laboratoriyada",
      d: "Qabulda",
      t: "Davolanmoqda",
      f: "Yakunlangan",
      rc: "Sog'aygan",
    };
    return status ? statusLabels[status] || status : "Noma'lum";
  };

  const selectedPatientData = selectedPatient
    ? patients.find((p) => p.id.toString() === selectedPatient)
    : null;
  const viewingPatientData = viewingPatient
    ? patients.find((p) => p.id === viewingPatient)
    : null;
  const editingPatientData = editingPatientId
    ? patients.find((p) => p.id === editingPatientId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bemorlar konsultatsiyasi
        </h1>
        <p className="text-muted-foreground">
          Sizga biriktirilgan bemorlarni ko'rish va konsultatsiya o'tkazish.
        </p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Navbatdagi bemorlar</TabsTrigger>
          <TabsTrigger value="consultation">Yangi konsultatsiya</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope size={20} /> Bemorni tanlang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Bemor</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bemorni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePatients.map((patient, index) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          №{index + 1} - {patient.name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatientData && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Bemor ma'lumotlari</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Ism-familiya:
                        </span>
                        <span>
                          {selectedPatientData.name}{" "}
                          {selectedPatientData.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yoshi:</span>
                        <span>
                          {new Date().getFullYear() -
                            new Date(
                              selectedPatientData.birth_date
                            ).getFullYear()}{" "}
                          yosh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jinsi:</span>
                        <span>
                          {selectedPatientData.gender === "e"
                            ? "Erkak"
                            : "Ayol"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span>{selectedPatientData.phone_number}</span>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium">Shikoyat</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPatientData.disease}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} /> Konsultatsiya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => handleSubmit(e, "f")}
                  className="space-y-4"
                >
                  <Tabs defaultValue="uz" className="w-full">
                    <TabsList>
                      <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
                      <TabsTrigger value="ru">Русский</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="uz" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis_uz">Diagnoz (O'zb) *</Label>
                        <Textarea
                          id="diagnosis_uz"
                          value={formData.diagnosis_uz}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diagnosis_uz: e.target.value,
                            })
                          }
                          placeholder="Diagnozni kiriting..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recommendation_uz">
                          Tavsiyalar (O'zb) *
                        </Label>
                        <Textarea
                          id="recommendation_uz"
                          value={formData.recommendation_uz}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recommendation_uz: e.target.value,
                            })
                          }
                          placeholder="Tavsiyalarni kiriting..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipe_uz">Retsept (O'zb) *</Label>
                        <Textarea
                          id="recipe_uz"
                          value={formData.recipe_uz}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipe_uz: e.target.value,
                            })
                          }
                          placeholder="Dori-darmonlarni kiriting..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="ru" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis_ru">Диагноз (Рус) *</Label>
                        <Textarea
                          id="diagnosis_ru"
                          value={formData.diagnosis_ru}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diagnosis_ru: e.target.value,
                            })
                          }
                          placeholder="Введите диагноз..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recommendation_ru">
                          Рекомендации (Рус) *
                        </Label>
                        <Textarea
                          id="recommendation_ru"
                          value={formData.recommendation_ru}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recommendation_ru: e.target.value,
                            })
                          }
                          placeholder="Введите рекомендации..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipe_ru">Рецепт (Рус) *</Label>
                        <Textarea
                          id="recipe_ru"
                          value={formData.recipe_ru}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipe_ru: e.target.value,
                            })
                          }
                          placeholder="Введите лекарства..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnosis (Eng) *</Label>
                        <Textarea
                          id="diagnosis"
                          value={formData.diagnosis}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diagnosis: e.target.value,
                            })
                          }
                          placeholder="Enter diagnosis..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recommendation">
                          Recommendations (Eng) *
                        </Label>
                        <Textarea
                          id="recommendation"
                          value={formData.recommendation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recommendation: e.target.value,
                            })
                          }
                          placeholder="Enter recommendations..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipe">Prescription (Eng) *</Label>
                        <Textarea
                          id="recipe"
                          value={formData.recipe}
                          onChange={(e) =>
                            setFormData({ ...formData, recipe: e.target.value })
                          }
                          placeholder="Enter prescription..."
                          required
                          disabled={!selectedPatient || isSubmitting}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e: FormEvent) => handleSubmit(e, "t")}
                      disabled={!selectedPatient || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Pill className="w-4 h-4 mr-2" />
                      )}
                      Davolash davom etsin
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedPatient || isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Yakunlash
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Bemorlar yuklanmoqda...
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center text-red-500">
                  <p>{error}</p>
                </CardContent>
              </Card>
            ) : availablePatients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Navbatda bemorlar yo'q
                  </p>
                </CardContent>
              </Card>
            ) : (
              availablePatients.map((patient, index) => (
                <Card
                  key={patient.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-lg font-bold">
                            №{index + 1}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="font-semibold">
                            {patient.name} {patient.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.gender === "e" ? "Erkak" : "Ayol"} •{" "}
                            {new Date().getFullYear() -
                              new Date(patient.birth_date).getFullYear()}{" "}
                            yosh
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Shikoyat:
                            </span>{" "}
                            {patient.disease}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Badge>
                              {getStatusLabel(patient.patient_status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 self-start md:self-center">
                        <Dialog
                          open={editingPatientId === patient.id}
                          onOpenChange={(open: boolean) =>
                            !open && setEditingPatientId(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPatientId(patient.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Statusni tahrirlash
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Bemor statusini tahrirlash
                              </DialogTitle>
                              <DialogDescription>
                                Bemor holatini yangilash
                              </DialogDescription>
                            </DialogHeader>
                            {editingPatientData && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Yangi statusni tanlang</Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    <Button
                                      variant={
                                        editingPatientData.patient_status ===
                                        "d"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="justify-start"
                                      onClick={() =>
                                        handleEditPatientStatus(patient.id, "d")
                                      }
                                      disabled={isSubmitting}
                                    >
                                      Qabulda
                                    </Button>
                                    <Button
                                      variant={
                                        editingPatientData.patient_status ===
                                        "t"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="justify-start"
                                      onClick={() =>
                                        handleEditPatientStatus(patient.id, "t")
                                      }
                                      disabled={isSubmitting}
                                    >
                                      Davolanmoqda
                                    </Button>
                                    <Button
                                      variant={
                                        editingPatientData.patient_status ===
                                        "f"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="justify-start"
                                      onClick={() =>
                                        handleEditPatientStatus(patient.id, "f")
                                      }
                                      disabled={isSubmitting}
                                    >
                                      Yakunlangan
                                    </Button>
                                    <Button
                                      variant={
                                        editingPatientData.patient_status ===
                                        "l"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="justify-start"
                                      onClick={() =>
                                        handleEditPatientStatus(patient.id, "l")
                                      }
                                      disabled={isSubmitting}
                                    >
                                      Laboratoriyaga qaytarish
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={viewingPatient === patient.id}
                          onOpenChange={(open: boolean) =>
                            !open && setViewingPatient(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewPatientHistory(patient.id)
                              }
                            >
                              <History className="w-4 h-4 mr-2" />
                              Ma'lumotlar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Bemor tarixi: {patient.name} {patient.last_name}
                              </DialogTitle>
                              <DialogDescription>
                                Bemorning o'tgan konsultatsiyalari va
                                ma'lumotlari.
                              </DialogDescription>
                            </DialogHeader>
                            {isHistoryLoading ? (
                              <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : detailedPatient ? (
                              <div className="py-4 space-y-4">
                                <h4 className="font-semibold">
                                  O'tgan konsultatsiyalar
                                </h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4">
                                  {detailedPatient.consultations &&
                                  detailedPatient.consultations.length > 0 ? (
                                    detailedPatient.consultations.map(
                                      (consult) => (
                                        <div
                                          key={consult.id}
                                          className="p-3 border rounded-md"
                                        >
                                          <p className="font-semibold text-sm">
                                            Sana:{" "}
                                            {consult.created_at
                                              ? new Date(
                                                  consult.created_at
                                                ).toLocaleString()
                                              : "Noma'lum"}
                                          </p>
                                          <p className="text-sm mt-1">
                                            <span className="font-medium">
                                              Diagnoz:
                                            </span>{" "}
                                            {consult.diagnosis}
                                          </p>
                                          <p className="text-sm mt-1">
                                            <span className="font-medium">
                                              Tavsiyalar:
                                            </span>{" "}
                                            {consult.recommendation}
                                          </p>
                                          <p className="text-sm mt-1">
                                            <span className="font-medium">
                                              Retsept:
                                            </span>{" "}
                                            {consult.recipe}
                                          </p>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      Bu bemor uchun o'tgan konsultatsiyalar
                                      topilmadi.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-center text-muted-foreground p-8">
                                Ma'lumotlar topilmadi.
                              </p>
                            )}
                          </DialogContent>
                        </Dialog>
                        {patient.patient_status !== "d" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartConsultation(patient.id)}
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Qabul boshlash
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
