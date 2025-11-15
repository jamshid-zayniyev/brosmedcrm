import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Users,
  Search,
  Edit,
  History,
  Printer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { patientService } from "../../services/patient.service";
import { departmentService } from "../../services/department.service";
import { departmentTypeService } from "../../services/department-type.service";

// Yangi interfeyslar
interface DepartmentType {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department: number;
  price: number;
}

// Yangilangan Doctor interfeysi
interface Doctor {
  id: number;
  full_name: string;
  price: string;
}

// Yangilangan Department interfeysi
interface Department {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department_types: DepartmentType[];
}

// Yangilangan Patient interfeysi
interface PatientHistory {
  id: number;
  date: string;
  type: "registration" | "lab-test" | "consultation" | "payment" | "other";
  description: string;
  doctorName?: string;
  department?: string;
  amount?: number;
  diagnosis?: string;
  recommendations?: string;
  prescription?: string;
  labTest?: string;
  labResult?: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender: "e" | "a";
  birthDate: string;
  phone: string;
  address: string;
  diseaseType: string;
  department: string;
  departmentId: number;
  departmentTypeId?: number;
  doctorId?: number;
  doctorName?: string;
  paymentAmount?: number;
  paymentStatus: "pending" | "paid" | "partial";
  status:
    | "registered"
    | "in-lab"
    | "with-doctor"
    | "completed"
    | "under-treatment"
    | "cured"
    | "discharged"
    | "cancelled";
  queueNumber?: number;
  registrationDate: string;
  history: PatientHistory[];
}

const toPatient = (data: any): Patient => ({
  id: data.id.toString(),
  firstName: data.name,
  lastName: data.last_name,
  gender: data.gender,
  birthDate: data.birth_date,
  phone: data.phone_number,
  address: data.address,
  diseaseType: data.disease,
  department: data.department.title_uz,
  departmentId: data.department.id,
  departmentTypeId: data.department_types?.[0]?.id,
  doctorId: data.user?.id,
  paymentAmount: data.payment_amount || 0,
  paymentStatus: data.payment_status,
  status: data.patient_status,
  registrationDate: data.created_at || new Date().toISOString(),
  history: data.history || [],
});

const toPatientDto = (patient: Partial<Patient>) => {
  const dto: any = {};
  if (patient.id) dto.id = parseInt(patient.id, 10);
  if (patient.firstName) dto.name = patient.firstName;
  if (patient.lastName) dto.last_name = patient.lastName;
  if (patient.gender) dto.gender = patient.gender;
  if (patient.birthDate) dto.birth_date = patient.birthDate;
  if (patient.phone) dto.phone_number = patient.phone;
  if (patient.address) dto.address = patient.address;
  if (patient.diseaseType) dto.disease = patient.diseaseType;
  if (patient.departmentId) dto.department = patient.departmentId;
  if (patient.departmentTypeId) dto.department_types = patient.departmentTypeId;
  if (patient.doctorId) dto.user = patient.doctorId;
  if (patient.paymentStatus) dto.payment_status = patient.paymentStatus;
  if (patient.status) dto.patient_status = patient.status;
  return dto;
};

export function PatientQueue() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);

  // Tahrirlash oynasi uchun yangi state'lar
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [editMode, setEditMode] = useState<"types" | "doctors" | null>(null);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // New state for save button loading

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientData, departmentData, departmentTypeData] = await Promise.all([
          patientService.findAll(),
          departmentService.findAll(),
          departmentTypeService.findAll(),
        ]);
        setPatients((patientData.results || patientData).map(toPatient));
        setDepartments(departmentData.results || departmentData);
        setDepartmentTypes(departmentTypeData.results || departmentTypeData);
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updatePatientState = (patientId: number, updates: Partial<Patient>) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => (p.id === patientId ? { ...p, ...updates } : p))
    );
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.queueNumber?.toString().includes(searchQuery);

    const matchesDepartment =
      filterDepartment === "all" || patient.department === filterDepartment;
    const matchesStatus =
      filterStatus === "all" || patient.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      registered: {
        label: "Ro'yxatda",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      "in-lab": {
        label: "Laboratoriyada",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      "with-doctor": {
        label: "Shifokor oldida",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
      completed: {
        label: "Yakunlangan",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      "under-treatment": {
        label: "Davolanmoqda",
        className:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      },
      cured: {
        label: "Sog'aygan",
        className:
          "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      },
      discharged: {
        label: "Chiqarilgan",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      },
      cancelled: {
        label: "Bekor qilingan",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
    };
    return statusConfig[status] || statusConfig["registered"];
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Kutilmoqda",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      partial: {
        label: "Qisman",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      paid: {
        label: "To'langan",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
    };
    return statusConfig[status] || statusConfig["pending"];
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFormData({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: patient.gender,
      birthDate: patient.birthDate,
      phone: patient.phone,
      address: patient.address,
      diseaseType: patient.diseaseType,
      departmentId: patient.departmentId,
      departmentTypeId: patient.departmentTypeId,
      doctorId: patient.doctorId,
      paymentAmount: patient.paymentAmount,
      paymentStatus: patient.paymentStatus,
      status: patient.status,
    });

    // Bo'lim turi yoki shifokorlar rejimini avtomatik o'rnatish
    const department = departments.find(d => d.id === patient.departmentId);
    if (department) {
      if (department.department_types && department.department_types.length > 0) {
        setEditMode("types");
      } else {
        setEditMode("doctors");
        // Agar bo'limda shifokorlar bo'lsa, ularni yuklash
        if (patient.doctorId) {
          handleEditDepartmentChange(patient.departmentId.toString());
        }
      }
    }
  };

  const handleEditDepartmentChange = async (value: string) => {
    const departmentId = parseInt(value, 10);
    const department = departments.find((d) => d.id === departmentId);

    setEditFormData({
      ...editFormData,
      departmentId: departmentId,
      departmentTypeId: undefined,
      doctorId: undefined,
      paymentAmount: 0,
    });
    setDoctors([]);
    setEditMode(null);

    if (!department) return;

    if (department.department_types && department.department_types.length > 0) {
      setEditMode("types");
    } else {
      setEditMode("doctors");
      setIsLoadingDoctors(true);
      try {
        const doctorsData = await departmentService.findDoctorsByDepartment(departmentId);
        setDoctors(doctorsData.results || doctorsData || []);
      } catch (error) {
        toast.error("Shifokorlarni yuklashda xatolik");
      } finally {
        setIsLoadingDoctors(false);
      }
    }
  };

  const handleEditDepartmentTypeChange = (value: string) => {
    const typeId = parseInt(value, 10);
    const depType = departmentTypes.find((t) => t.id === typeId);
    setEditFormData({
      ...editFormData,
      departmentTypeId: typeId,
      doctorId: undefined,
      paymentAmount: depType?.price || 0,
    });
  };

  const handleEditDoctorChange = (value: string) => {
    const doctorId = parseInt(value, 10);
    const doctor = doctors.find((d) => d.id === doctorId);
    setEditFormData({
      ...editFormData,
      departmentTypeId: undefined,
      doctorId: doctorId,
      paymentAmount: doctor ? parseInt(doctor.price, 10) : 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPatient) return;

    setIsSaving(true); // Start loading

    try {
      await patientService.update(toPatientDto(editFormData));

      // Lokal state'ni yangilash
      const department = departments.find(d => d.id === editFormData.departmentId);
      const doctor = doctors.find(d => d.id === editFormData.doctorId);
      const departmentType = departmentTypes.find(t => t.id === editFormData.departmentTypeId);
      
      const updatedPatientData = {
        ...editingPatient,
        ...editFormData,
        department: department?.title_uz || editingPatient.department,
        doctorName: doctor?.full_name || undefined,
        paymentAmount: editFormData.paymentAmount || editingPatient.paymentAmount,
      };

      updatePatientState(editingPatient.id, updatedPatientData);

      toast.success("Bemor ma'lumotlari yangilandi");
      setEditingPatient(null);
      setEditFormData({});
      setEditMode(null);
      setDoctors([]);
    } catch (error) {
      toast.error("Bemor ma'lumotlarini yangilashda xatolik");
    } finally {
      setIsSaving(false); // End loading
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Bemorlar navbati</h1>
        <p className="text-muted-foreground">
          Barcha bemorlar: {patients.length} ta
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish (ism, telefon, navbat raqami)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bo'lim bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha bo'limlar</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.title_uz}>
                    {dept.title_uz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha statuslar</SelectItem>
                <SelectItem value="registered">Ro'yxatda</SelectItem>
                <SelectItem value="in-lab">Laboratoriyada</SelectItem>
                <SelectItem value="with-doctor">Shifokor oldida</SelectItem>
                <SelectItem value="under-treatment">Davolanmoqda</SelectItem>
                <SelectItem value="completed">Yakunlangan</SelectItem>
                <SelectItem value="cured">Sog'aygan</SelectItem>
                <SelectItem value="discharged">Chiqarilgan</SelectItem>
                <SelectItem value="cancelled">Bekor qilingan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-[80px]" />
                    <Skeleton className="h-5 w-[80px]" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Bemorlar topilmadi</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary">
                        №{patient.queueNumber}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h3>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.gender === "e" ? "Erkak" : "Ayol"} •{" "}
                          {new Date().getFullYear() -
                            new Date(patient.birthDate).getFullYear()}{" "}
                          yosh
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{patient.department}</Badge>
                        {patient.doctorName && (
                          <Badge variant="outline">{patient.doctorName}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={getStatusBadge(patient.status).className}
                        >
                          {getStatusBadge(patient.status).label}
                        </Badge>
                        <Badge
                          className={
                            getPaymentBadge(patient.paymentStatus).className
                          }
                        >
                          {getPaymentBadge(patient.paymentStatus).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* View Details Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          Ko'rish
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Bemor ma'lumotlari va tarixi
                          </DialogTitle>
                          <DialogDescription>
                            Bemor haqida to'liq ma'lumot va tibbiy tarix
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPatient && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Ism
                                </p>
                                <p>{selectedPatient.firstName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Familiya
                                </p>
                                <p>{selectedPatient.lastName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Tug'ilgan sana
                                </p>
                                <p>
                                  {new Date(
                                    selectedPatient.birthDate
                                  ).toLocaleDateString("uz-UZ")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Telefon
                                </p>
                                <p>{selectedPatient.phone}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">
                                  Manzil
                                </p>
                                <p>{selectedPatient.address}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">
                                  Kasallik
                                </p>
                                <p>{selectedPatient.diseaseType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  To'lov miqdori
                                </p>
                                <p>
                                  {selectedPatient.paymentAmount?.toLocaleString()}{" "}
                                  so'm
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  To'lov holati
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    className={
                                      getPaymentBadge(selectedPatient.paymentStatus)
                                        .className
                                    }
                                  >
                                    {
                                      getPaymentBadge(selectedPatient.paymentStatus)
                                        .label
                                    }
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Bemor holati
                                </p>
                                <div className="mt-1">
                                  <Badge
                                    className={
                                      getStatusBadge(selectedPatient.status).className
                                    }
                                  >
                                    {getStatusBadge(selectedPatient.status).label}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Bo'lim
                                </p>
                                <p>{selectedPatient.department}</p>
                              </div>
                              {selectedPatient.doctorName && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Shifokor
                                  </p>
                                  <p>{selectedPatient.doctorName}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Ro'yxatga olingan sana
                                </p>
                                <p>
                                  {new Date(
                                    selectedPatient.registrationDate
                                  ).toLocaleString("uz-UZ")}
                                </p>
                              </div>
                            </div>

                            {/* Patient History */}
                            {selectedPatient.history &&
                              selectedPatient.history.length > 0 && (
                                <>
                                  <Separator />
                                  <div className="space-y-3">
                                    <h4 className="flex items-center gap-2">
                                      <History className="w-4 h-4" />
                                      Bemor tarixi
                                    </h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                      {[...selectedPatient.history]
                                        .reverse()
                                        .map((entry) => (
                                          <Card key={entry.id} className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                              <Badge variant="outline">
                                                {entry.type === "registration"
                                                  ? "Ro'yxat"
                                                  : entry.type === "lab-test"
                                                  ? "Tahlil"
                                                  : entry.type ===
                                                    "consultation"
                                                  ? "Konsultatsiya"
                                                  : entry.type === "payment"
                                                  ? "To'lov"
                                                  : "O'zgarish"}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                  entry.date
                                                ).toLocaleString("uz-UZ")}
                                              </span>
                                            </div>
                                            <p className="text-sm mb-1">
                                              {entry.description}
                                            </p>
                                            {entry.doctorName && (
                                              <p className="text-xs text-muted-foreground">
                                                Shifokor: {entry.doctorName}
                                              </p>
                                            )}
                                            {entry.diagnosis && (
                                              <div className="mt-2 space-y-1">
                                                <p className="text-xs">
                                                  <strong>Tashxis:</strong>{" "}
                                                  {entry.diagnosis}
                                                </p>
                                                {entry.recommendations && (
                                                  <p className="text-xs">
                                                    <strong>Tavsiyalar:</strong>{" "}
                                                    {entry.recommendations}
                                                  </p>
                                                )}
                                                {entry.prescription && (
                                                  <p className="text-xs">
                                                    <strong>Retsept:</strong>{" "}
                                                    {entry.prescription}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                            {entry.labTest && (
                                              <div className="mt-2">
                                                <p className="text-xs">
                                                  <strong>Tahlil:</strong>{" "}
                                                  {entry.labTest}
                                                </p>
                                                {entry.labResult && (
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {entry.labResult}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                            {entry.amount && (
                                              <p className="text-xs text-muted-foreground">
                                                To'lov:{" "}
                                                {entry.amount.toLocaleString()}{" "}
                                                so'm
                                              </p>
                                            )}
                                          </Card>
                                        ))}
                                    </div>
                                  </div>
                                </>
                              )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Edit Patient Dialog */}
                    <Dialog
                      open={editingPatient?.id === patient.id}
                      onOpenChange={(open) => !open && setEditingPatient(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Tahrirlash
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Bemor ma'lumotlarini tahrirlash
                          </DialogTitle>
                          <DialogDescription>
                            Bemor shaxsiy va tibbiy ma'lumotlarini yangilash
                          </DialogDescription>
                        </DialogHeader>
                        {editingPatient && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-firstName">Ism</Label>
                                <Input
                                  id="edit-firstName"
                                  value={editFormData.firstName || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      firstName: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-lastName">Familiya</Label>
                                <Input
                                  id="edit-lastName"
                                  value={editFormData.lastName || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      lastName: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Jinsi</Label>
                              <RadioGroup
                                value={editFormData.gender}
                                onValueChange={(value: "e" | "a") =>
                                  setEditFormData({
                                    ...editFormData,
                                    gender: value,
                                  })
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="e" id="edit-male" />
                                  <Label htmlFor="edit-male">Erkak</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="a" id="edit-female" />
                                  <Label htmlFor="edit-female">Ayol</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-birthDate">
                                  Tug'ilgan sana
                                </Label>
                                <Input
                                  id="edit-birthDate"
                                  type="date"
                                  value={editFormData.birthDate || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      birthDate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefon</Label>
                                <Input
                                  id="edit-phone"
                                  value={editFormData.phone || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-address">Manzil</Label>
                              <Textarea
                                id="edit-address"
                                value={editFormData.address || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    address: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-diseaseType">
                                Kasallik / Shikoyat
                              </Label>
                              <Textarea
                                id="edit-diseaseType"
                                value={editFormData.diseaseType || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    diseaseType: e.target.value,
                                  })
                                }
                              />
                            </div>

                            {/* Yangi Bo'lim va Xizmat tanlash qismi */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-department">Bo'lim</Label>
                                <Select
                                  value={editFormData.departmentId?.toString() || ""}
                                  onValueChange={handleEditDepartmentChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bo'limni tanlang" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((dept) => (
                                      <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.title_uz}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {isLoadingDoctors && (
                                <p className="text-sm text-muted-foreground">
                                  Shifokorlar yuklanmoqda...
                                </p>
                              )}

                              {editMode === "types" && (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-departmentType">Bo'lim turi</Label>
                                  <Select
                                    value={editFormData.departmentTypeId?.toString() || ""}
                                    onValueChange={handleEditDepartmentTypeChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Bo'lim turini tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {departmentTypes
                                        .filter(t => t.department === editFormData.departmentId)
                                        .map((type) => (
                                          <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.title_uz} - {Number(type.price).toLocaleString()} so'm
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {editMode === "doctors" && doctors.length > 0 && (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-doctor">Shifokor</Label>
                                  <Select
                                    value={editFormData.doctorId?.toString() || ""}
                                    onValueChange={handleEditDoctorChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Shifokorni tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                          {doctor.full_name} - {Number(doctor.price).toLocaleString()} so'm
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-paymentAmount">
                                  To'lov miqdori
                                </Label>
                                <Input
                                  id="edit-paymentAmount"
                                  type="text"
                                  value={
                                    editFormData.paymentAmount
                                      ? editFormData.paymentAmount.toLocaleString() + " so'm"
                                      : "0 so'm"
                                  }
                                  readOnly
                                  className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Narx avtomatik hisoblanadi
                                </p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  To'lov holati
                                </p>
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                  <Badge
                                    className={
                                      getPaymentBadge(editingPatient.paymentStatus)
                                        .className
                                    }
                                  >
                                    {
                                      getPaymentBadge(editingPatient.paymentStatus)
                                        .label
                                    }
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    (faqat ko'rish)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Bemor holati
                                </p>
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                  <Badge
                                    className={
                                      getStatusBadge(editingPatient.status).className
                                    }
                                  >
                                    {getStatusBadge(editingPatient.status).label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    (faqat ko'rish)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={handleSaveEdit}
                                className="flex-1"
                              >
                                Saqlash
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingPatient(null)}
                                className="flex-1"
                              >
                                Bekor qilish
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <span className="text-sm text-muted-foreground text-right">
                      {new Date(patient.registrationDate).toLocaleString(
                        "uz-UZ"
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Qabul check</DialogTitle>
            <DialogDescription>Bemorning qabul cheki</DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 print:p-8">
              <div className="text-center border-b pb-4">
                <h2>KLINIKA BOSHQARUV TIZIMI</h2>
                <p className="text-muted-foreground">Qabul check</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bemor:</span>
                  <span>{receiptData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bo'lim:</span>
                  <span>{receiptData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Xizmat:</span>
                  <span>{receiptData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sana:</span>
                  <span>
                    {new Date(receiptData.date).toLocaleString("uz-UZ")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">To'lov:</span>
                  <span className="font-medium">
                    {receiptData.amount?.toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <Button onClick={handlePrintReceipt} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Chop etish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReceipt(false)}
                  className="flex-1"
                >
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}