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
import { PatientStatus } from "../../interfaces/patient.interface";
import { patientService } from "../../services/patient.service";
import { useUserStore } from "../../stores/user.store";
import { consultationService } from "../../services/consultation.service";
import { CreateConsultationDto } from "../../interfaces/consultation.dto";
import { diseaseService } from "../../services/disease.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Assuming a structure for the patient record from the 'diseases' array
interface PatientRecord {
  id: number; // ID of the disease record itself
  patient: {
    // Nested patient object
    id: number;
    name: string;
    last_name: string;
    gender: "e" | "a"; // 'e' for erkak (male), 'a' for ayol (female)
    birth_date: string;
    phone_number: string;
    patient_status: PatientStatus;
    // ... other patient fields
  };
  disease: string; // The complaint/disease is directly on the record
  // ... other fields from the disease record
}

// Added interface for Disease from patient-analysis.tsx
interface Disease {
  id: number;
  disease: string;
  patient: number;
  department: {
    title?: string;
  };
  department_types?: {
    title?: string;
  };
  user?: {
    full_name: string;
  };
}

export function PatientConsultation() {
  const { user } = useUserStore();

  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]); // Renamed from 'patients'
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientDiseases, setPatientDiseases] = useState<Disease[]>([]); // New state for disease history
  const [loadingDiseaseHistory, setLoadingDiseaseHistory] = useState(false); // New state for disease history loading

  const [selectedPatient, setSelectedPatient] = useState("");
  const [viewingPatient, setViewingPatient] = useState<number | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [detailedPatient, setDetailedPatient] = useState<any | null>(null); // detailedPatient likely fetches a full Patient object
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const responseData = await patientService.findAllForDoctor(); // No longer assuming Patient[] directly
      if (responseData && Array.isArray(responseData.diseases)) {
        setPatientRecords(responseData.diseases);
      } else {
        console.error(
          "Xatolik: 'diseases' ma'lumoti massiv emas yoki topilmadi!",
          responseData
        );
        setPatientRecords([]); // Fallback to empty array
      }
    } catch (err) {
      setError("Bemorlarni yuklashda xatolik yuz berdi.");
      console.error(err);
      setPatientRecords([]); // Clear on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const fetchDiseaseHistory = async () => {
      if (!selectedPatient) {
        setPatientDiseases([]);
        return;
      }
      setLoadingDiseaseHistory(true);
      try {
        const patientId = parseInt(selectedPatient, 10);
        const diseasesRes = await diseaseService.findDiseaseForPatient(
          patientId
        );
        setPatientDiseases(diseasesRes.results || diseasesRes);
      } catch (err) {
        toast.error("Bemor kasallik tarixini yuklashda xatolik yuz berdi.");
        console.error(err);
        setPatientDiseases([]);
      } finally {
        setLoadingDiseaseHistory(false);
      }
    };

    fetchDiseaseHistory();
  }, [selectedPatient]);

  const [labResults, setLabResults] = useState<LabResult[]>([]); // This might need review later if patientId changes

  // Update function adapted for nested patient object
  const updatePatient = (
    id: number,
    data: Partial<PatientRecord["patient"]>
  ) => {
    setPatientRecords((prev) =>
      prev.map((record) =>
        record.patient?.id === id
          ? { ...record, patient: { ...record.patient, ...data } }
          : record
      )
    );
  };

  const [formData, setFormData] = useState({
    diagnosis: "",
    recommendation: "",
    recipe: "",
  });

  const availablePatients = patientRecords.filter(
    (record) =>
      record.patient &&
      (record.patient.patient_status === "r" ||
        record.patient.patient_status === "l" ||
        record.patient.patient_status === "d" ||
        record.patient.patient_status === "t")
  );

  const handleViewPatientHistory = async (patientId: number) => {
    setViewingPatient(patientId);
    setIsHistoryLoading(true);
    setDetailedPatient(null);
    try {
      // Assuming patientService.findById returns a full Patient object
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
      await fetchPatients(); // Refetch to get updated status
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

    const { diagnosis, recommendation, recipe } = formData;

    if (!diagnosis || !recommendation || !recipe) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring.");
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
        recommendation: "",
        recipe: "",
      });
      setSelectedPatient("");
      await fetchPatients(); // Refetch to get updated queue
    } catch (error) {
      toast.error("Konsultatsiya yaratishda xatolik yuz berdi.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPatientLabResults = (patientId: number) => {
    // This function might need adaptation if labResults also changes structure or patientId.
    // For now, assuming it expects a simple patientId.
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
      // Update local state for immediate feedback
      updatePatient(patientId, { patient_status: newStatus });
      toast.success("Bemor statusi muvaffaqiyatli yangilandi.");
      await fetchPatients(); // Refetch to ensure consistency
    } catch (error) {
      toast.error("Bemor statusini yangilashda xatolik.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setEditingPatientId(null);
    }
  };

  const getStatusLabel = (status: PatientStatus | undefined) => {
    // status can be undefined now
    const statusLabels = {
      r: "Kutmoqda",
      l: "Laboratoriyada",
      d: "Qabulda",
      t: "Davolanmoqda",
      f: "Yakunlangan",
      rc: "Sog'aygan",
    };
    return status ? statusLabels[status] || status : "Noma'lum";
  };

  // Find selected patient record and extract the nested patient object
  const selectedPatientData = selectedPatient
    ? patientRecords.find(
        (record) => record.patient?.id.toString() === selectedPatient
      )?.patient
    : null;
  const viewingPatientData = viewingPatient
    ? patientRecords.find((record) => record.patient?.id === viewingPatient)
        ?.patient
    : null;
  const editingPatientData = editingPatientId
    ? patientRecords.find((record) => record.patient?.id === editingPatientId)
        ?.patient
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
          <TabsTrigger
            style={{
              height: "120px",
            }}
            value="queue"
          >
            Navbatdagi bemorlar
          </TabsTrigger>
          <TabsTrigger
            style={{
              height: "120px",
            }}
            value="consultation"
          >
            Yangi konsultatsiya
          </TabsTrigger>
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
                      {availablePatients.map(
                        (
                          record,
                          index // Changed 'patient' to 'record'
                        ) => (
                          <SelectItem
                            key={record.patient?.id} // Access patient.id
                            value={record.patient?.id.toString()} // Access patient.id
                          >
                            №{index + 1} - {record.patient?.name}{" "}
                            {record.patient?.last_name}{" "}
                            {/* Access patient.name/last_name */}
                          </SelectItem>
                        )
                      )}
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
                        {/* Assuming disease is available on the selectedPatientData if it was extracted correctly or from original patient record */}
                        {patientRecords.find(
                          (pr) => pr.patient?.id === selectedPatientData.id
                        )?.disease || "Noma'lum"}
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
                  <Button
                    type="submit"
                    disabled={!selectedPatient || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Yakunlash
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* New Disease History Section */}
          <Separator />
          <h3 className="font-semibold flex items-center gap-2">
            <History size={16} /> Kasallik Tarixi
          </h3>
          {loadingDiseaseHistory ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : patientDiseases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kasallik / Shikoyat</TableHead>
                  <TableHead>Bo'lim ID</TableHead>
                  <TableHead>Bo'lim Turi ID</TableHead>
                  <TableHead>Shifokor ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientDiseases.map((diseaseItem) => (
                  <TableRow key={diseaseItem.id}>
                    <TableCell>{diseaseItem.id}</TableCell>
                    <TableCell>{diseaseItem.disease}</TableCell>
                    <TableCell>
                      {diseaseItem.department?.title || "-"}
                    </TableCell>
                    <TableCell>
                      {diseaseItem?.department_types?.title || "-"}
                    </TableCell>
                    <TableCell>{diseaseItem.user?.full_name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Bemorning kasallik tarixi mavjud emas.
            </p>
          )}
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
              availablePatients.map(
                (
                  record,
                  index // Changed 'patient' to 'record'
                ) => (
                  <Card
                    key={record.patient?.id} // Access patient.id for key
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
                              {record.patient?.name} {record.patient?.last_name}{" "}
                              {/* Access patient.name/last_name */}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {record.patient?.gender === "e"
                                ? "Erkak"
                                : "Ayol"}{" "}
                              •{" "}
                              {new Date().getFullYear() -
                                new Date(
                                  record.patient?.birth_date || ""
                                ).getFullYear()}{" "}
                              {/* Access patient.birth_date */}
                              yosh
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">
                                Shikoyat:
                              </span>{" "}
                              {record.disease}{" "}
                              {/* Access disease directly from record */}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Badge>
                                {getStatusLabel(record.patient?.patient_status)}{" "}
                                {/* Access patient.patient_status */}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 self-start md:self-center">
                          <Dialog
                            open={editingPatientId === record.patient?.id} // Access patient.id
                            onOpenChange={(open: boolean) =>
                              !open && setEditingPatientId(null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingPatientId(
                                    record.patient?.id || null
                                  )
                                } // Access patient.id
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
                                        onClick={
                                          () =>
                                            handleEditPatientStatus(
                                              record.patient?.id || 0,
                                              "d"
                                            ) // Access patient.id
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
                                        onClick={
                                          () =>
                                            handleEditPatientStatus(
                                              record.patient?.id || 0,
                                              "t"
                                            ) // Access patient.id
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
                                        onClick={
                                          () =>
                                            handleEditPatientStatus(
                                              record.patient?.id || 0,
                                              "f"
                                            ) // Access patient.id
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
                                        onClick={
                                          () =>
                                            handleEditPatientStatus(
                                              record.patient?.id || 0,
                                              "l"
                                            ) // Access patient.id
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
                            open={viewingPatient === record.patient?.id} // Access patient.id
                            onOpenChange={(open: boolean) =>
                              !open && setViewingPatient(null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={
                                  () =>
                                    handleViewPatientHistory(
                                      record.patient?.id || 0
                                    ) // Access patient.id
                                }
                              >
                                <History className="w-4 h-4 mr-2" />
                                Ma'lumotlar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Bemor tarixi: {record.patient?.name}{" "}
                                  {record.patient?.last_name}{" "}
                                  {/* Access patient.name/last_name */}
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
                                        (
                                          consult: any // Type can be more specific if available
                                        ) => (
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
                          {record.patient?.patient_status !== "d" && ( // Access patient.patient_status
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStartConsultation(record.patient?.id || 0)
                              } // Access patient.id
                            >
                              <Stethoscope className="w-4 h-4 mr-2" />
                              Qabul boshlash
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
