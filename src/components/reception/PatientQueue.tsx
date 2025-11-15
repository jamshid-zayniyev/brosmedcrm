import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  Edit,
  History,
  Printer,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Patient, PatientStatus } from "../../interfaces/patient.interface";
import { User } from "../../interfaces/user.interface";
import { Consultation } from "../../interfaces/consultation.interface";
import { patientService } from "../../services/patient.service";
import { departmentService } from "../../services/department.service";
import { departmentTypeService } from "../../services/department-type.service";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";

// ==================== TYPES ====================
interface DepartmentType {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department: number;
  price: number;
}

interface Doctor extends User {
  price: string;
}

interface Department {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department_types: DepartmentType[];
}

// ==================== CONSTANTS ====================
const STATUS_CONFIG = {
  r: {
    label: "Ro'yxatda",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  l: {
    label: "Laboratoriyada",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  d: {
    label: "Shifokor oldida",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  t: {
    label: "Davolanmoqda",
    className:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  },
  f: {
    label: "Yakunlangan",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  rc: {
    label: "Sog'aygan",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  },
  all: {
    label: "Barcha statuslar",
    className: "",
  },
} as const;

const PAYMENT_STATUS_CONFIG = {
  p: {
    label: "Kutilmoqda",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  pc: {
    label: "Qisman",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  c: {
    label: "To'langan",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
} as const;

// ==================== UTILITY FUNCTIONS ====================
const getStatusBadge = (status: PatientStatus) => {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.r;
};

const getPaymentBadge = (status: "p" | "c" | "pc") => {
  return (status && PAYMENT_STATUS_CONFIG[status]) || PAYMENT_STATUS_CONFIG.p;
};

const calculateAge = (birthDate: string): number => {
  return new Date().getFullYear() - new Date(birthDate).getFullYear();
};

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} so'm`;
};

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("uz-UZ");
};

// ==================== DTO MAPPERS ====================
const toPatientDto = (patient: Partial<Patient>) => {
  const dto: any = {};
  if (patient.id) dto.id = patient.id;
  if (patient.name) dto.name = patient.name;
  if (patient.last_name) dto.last_name = patient.last_name;
  if (patient.middle_name) dto.middle_name = patient.middle_name;
  if (patient.gender) dto.gender = patient.gender;
  if (patient.birth_date) dto.birth_date = patient.birth_date;
  if (patient.phone_number) dto.phone_number = patient.phone_number;
  if (patient.address) dto.address = patient.address;
  if (patient.disease) dto.disease = patient.disease;
  if (patient.department) dto.department = patient.department;
  if (patient.department_types) dto.department_types = patient.department_types;
  if (patient.user) dto.user = patient.user;
  if (patient.payment_status) dto.payment_status = patient.payment_status;
  if (patient.patient_status) dto.patient_status = patient.patient_status;
  return dto;
};

// ==================== SUB-COMPONENTS ====================
const PatientCard = ({
  patient,
  onView,
  onEdit,
  departments,
}: {
  patient: Patient;
  onView: () => void;
  onEdit: () => void;
  departments: Department[];
}) => {
  const department = departments.find((d) => d.id === patient.department);
  const age = calculateAge(patient.birth_date);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold">№{patient.id}</span>
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold">
                  {patient.name} {patient.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {patient.gender === "e" ? "Erkak" : "Ayol"} • {age} yosh
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{department?.title_uz}</Badge>
                {patient.user && (
                  <Badge variant="outline">Shifokor ID: {patient.user}</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  className={getStatusBadge(patient.patient_status).className}
                >
                  {getStatusBadge(patient.patient_status).label}
                </Badge>
                <Badge
                  className={getPaymentBadge(patient.payment_status).className}
                >
                  {getPaymentBadge(patient.payment_status).label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              Ko'rish
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Tahrirlash
            </Button>
            <span className="text-sm text-muted-foreground text-right">
              {formatDateTime(patient.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientDetailsDialog = ({
  patient,
  open,
  onOpenChange,
  departments,
}: {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
}) => {
  if (!patient) return null;

  const department = departments.find((d) => d.id === patient.department);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bemor ma'lumotlari va tarixi</DialogTitle>
          <DialogDescription>
            Bemor haqida to'liq ma'lumot va tibbiy tarix
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ism</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Familiya</p>
              <p className="font-medium">{patient.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tug'ilgan sana</p>
              <p className="font-medium">
                {new Date(patient.birth_date).toLocaleDateString("uz-UZ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{patient.phone_number}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Manzil</p>
              <p className="font-medium">{patient.address}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Kasallik</p>
              <p className="font-medium">
                {patient.disease_uz || patient.disease}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To'lov holati</p>
              <Badge
                className={getPaymentBadge(patient.payment_status).className}
              >
                {getPaymentBadge(patient.payment_status).label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bemor holati</p>
              <Badge
                className={getStatusBadge(patient.patient_status).className}
              >
                {getStatusBadge(patient.patient_status).label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bo'lim</p>
              <p className="font-medium">{department?.title_uz}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ro'yxatga olingan sana
              </p>
              <p className="font-medium">
                {formatDateTime(patient.created_at)}
              </p>
            </div>
          </div>

          {patient.consultations && patient.consultations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold">
                  <History className="w-4 h-4" />
                  Konsultatsiyalar tarixi
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[...patient.consultations].reverse().map((consultation) => (
                    <Card key={consultation.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">
                          Konsultatsiya #{consultation.id}
                        </Badge>
                        {consultation.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(consultation.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        {consultation.diagnosis_uz && (
                          <div>
                            <strong>Tashxis:</strong>{" "}
                            {consultation.diagnosis_uz}
                          </div>
                        )}
                        {consultation.recommendation_uz && (
                          <div>
                            <strong>Tavsiyalar:</strong>{" "}
                            {consultation.recommendation_uz}
                          </div>
                        )}
                        {consultation.recipe_uz && (
                          <div>
                            <strong>Retsept:</strong> {consultation.recipe_uz}
                          </div>
                        )}
                        <div>
                          <strong>Status:</strong>{" "}
                          <Badge
                            className={
                              getStatusBadge(
                                consultation.patient_status as PatientStatus
                              ).className
                            }
                          >
                            {
                              getStatusBadge(
                                consultation.patient_status as PatientStatus
                              ).label
                            }
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PatientEditDialog = ({
  patient,
  open,
  onOpenChange,
  onSave,
  departments,
  departmentTypes,
  doctors,
  isLoadingDoctors,
  isSaving,
  onDepartmentChange,
  onDepartmentTypeChange,
  onDoctorChange,
}: {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Patient>) => void;
  departments: Department[];
  departmentTypes: DepartmentType[];
  doctors: Doctor[];
  isLoadingDoctors: boolean;
  isSaving: boolean;
  onDepartmentChange: (deptId: number) => void;
  onDepartmentTypeChange: (typeId: number) => void;
  onDoctorChange: (doctorId: number) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [editMode, setEditMode] = useState<"types" | "doctors" | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        id: patient.id,
        name: patient.name,
        last_name: patient.last_name,
        middle_name: patient.middle_name,
        gender: patient.gender,
        birth_date: patient.birth_date,
        phone_number: patient.phone_number,
        address: patient.address,
        disease: patient.disease,
        department: patient.department,
        department_types: patient.department_types,
        user: patient.user,
        payment_status: patient.payment_status,
        patient_status: patient.patient_status,
      });

      const dept = departments.find((d) => d.id === patient.department);
      if (dept) {
        if (dept.department_types && dept.department_types.length > 0) {
          setEditMode("types");
        } else {
          setEditMode("doctors");
          if (patient.user) {
            onDepartmentChange(patient.department);
          }
        }
      }
    }
  }, [patient, departments]);

  const handleDepartmentChange = (value: string) => {
    const deptId = parseInt(value, 10);
    const dept = departments.find((d) => d.id === deptId);

    setFormData({
      ...formData,
      department: deptId,
      department_types: undefined,
      user: undefined,
    });

    if (dept) {
      if (dept.department_types && dept.department_types.length > 0) {
        setEditMode("types");
      } else {
        setEditMode("doctors");
        onDepartmentChange(deptId);
      }
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  if (!patient) return null;

  const selectedDept = departments.find((d) => d.id === formData.department);
  const filteredTypes = departmentTypes.filter(
    (t) => t.department === formData.department
  );
  const selectedType = filteredTypes.find(
    (t) => t.id === formData.department_types
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bemor ma'lumotlarini tahrirlash</DialogTitle>
          <DialogDescription>
            Bemor shaxsiy va tibbiy ma'lumotlarini yangilash
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ism</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Familiya</Label>
              <Input
                id="edit-lastName"
                value={formData.last_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jinsi</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value: "e" | "a") =>
                setFormData({ ...formData, gender: value })
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
              <Label htmlFor="edit-birthDate">Tug'ilgan sana</Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={formData.birth_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                value={formData.phone_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Manzil</Label>
            <Textarea
              id="edit-address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-disease">Kasallik / Shikoyat</Label>
            <Textarea
              id="edit-disease"
              value={formData.disease || ""}
              onChange={(e) =>
                setFormData({ ...formData, disease: e.target.value })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-department">Bo'lim</Label>
              <Select
                value={formData.department?.toString() || ""}
                onValueChange={handleDepartmentChange}
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Shifokorlar yuklanmoqda...</AlertDescription>
              </Alert>
            )}

            {editMode === "types" && filteredTypes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="edit-departmentType">Bo'lim turi</Label>
                <Select
                  value={formData.department_types?.toString() || ""}
                  onValueChange={(val: string) => {
                    const typeId = parseInt(val, 10);
                    setFormData({ ...formData, department_types: typeId });
                    onDepartmentTypeChange(typeId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bo'lim turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.title_uz} - {formatCurrency(type.price)}
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
                  value={formData.user?.toString() || ""}
                  onValueChange={(val: string) => {
                    const doctorId = parseInt(val, 10);
                    setFormData({ ...formData, user: doctorId });
                    onDoctorChange(doctorId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Shifokorni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.full_name} -{" "}
                        {formatCurrency(parseInt(doctor.price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">To'lov holati</p>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <Badge
                  className={getPaymentBadge(patient.payment_status).className}
                >
                  {getPaymentBadge(patient.payment_status).label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (faqat ko'rish)
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Bemor holati</p>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <Badge
                  className={getStatusBadge(patient.patient_status).className}
                >
                  {getStatusBadge(patient.patient_status).label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (faqat ko'rish)
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MAIN COMPONENT ====================
export function PatientQueue() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState<PatientStatus | "all">(
    "all"
  );

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientData, departmentData, departmentTypeData] =
          await Promise.all([
            patientService.findAll(),
            departmentService.findAll(),
            departmentTypeService.findAll(),
          ]);

        setPatients(patientData.results || patientData);
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

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.name} ${patient.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        patient.phone_number.includes(searchQuery) ||
        patient.id.toString().includes(searchQuery);

      const dept = departments.find((d) => d.id === patient.department);
      const matchesDepartment =
        filterDepartment === "all" || dept?.title_uz === filterDepartment;

      const matchesStatus =
        filterStatus === "all" || patient.patient_status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [patients, searchQuery, filterDepartment, filterStatus, departments]);

  // Handle edit patient
  const handleEditPatient = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setShowEdit(true);
  }, []);

  // Handle view patient
  const handleViewPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  }, []);

  // Load doctors when department changes
  const handleDepartmentChange = useCallback(async (departmentId: number) => {
    setIsLoadingDoctors(true);
    try {
      const doctorsData = await departmentService.findDoctorsByDepartment(
        departmentId
      );
      setDoctors(doctorsData.results || doctorsData || []);
    } catch (error) {
      toast.error("Shifokorlarni yuklashda xatolik");
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  const handleDepartmentTypeChange = useCallback((typeId: number) => {
    // Handle department type change if needed
  }, []);

  const handleDoctorChange = useCallback((doctorId: number) => {
    // Handle doctor change if needed
  }, []);

  // Save edited patient
  const handleSaveEdit = useCallback(
    async (formData: Partial<Patient>) => {
      if (!editingPatient) return;

      setIsSaving(true);
      try {
        await patientService.update(toPatientDto(formData));

        // Update local state
        setPatients((prev) =>
          prev.map((p) =>
            p.id === editingPatient.id ? { ...p, ...formData } : p
          )
        );

        toast.success("Bemor ma'lumotlari yangilandi");
        setShowEdit(false);
        setEditingPatient(null);
        setDoctors([]);
      } catch (error) {
        toast.error("Bemor ma'lumotlarini yangilashda xatolik");
      } finally {
        setIsSaving(false);
      }
    },
    [editingPatient]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bemorlar navbati</h1>
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
                placeholder="Qidirish (ism, telefon, ID)"
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

            <Select
              value={filterStatus}
              onValueChange={(val: PatientStatus) =>
                setFilterStatus(val ?? "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha statuslar</SelectItem>
                <SelectItem value="r">Ro'yxatda</SelectItem>
                <SelectItem value="l">Laboratoriyada</SelectItem>
                <SelectItem value="d">Shifokor oldida</SelectItem>
                <SelectItem value="t">Davolanmoqda</SelectItem>
                <SelectItem value="f">Yakunlangan</SelectItem>
                <SelectItem value="rc">Sog'aygan</SelectItem>
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
                <div className="space-y-2 flex-1">
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
              <p className="text-lg font-medium">Bemorlar topilmadi</p>
              <p className="text-sm text-muted-foreground mt-2">
                Qidiruv natijalariga mos bemor yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              departments={departments}
              onView={() => handleViewPatient(patient)}
              onEdit={() => handleEditPatient(patient)}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <PatientDetailsDialog
        patient={selectedPatient}
        open={showDetails}
        onOpenChange={setShowDetails}
        departments={departments}
      />

      <PatientEditDialog
        patient={editingPatient}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSave={handleSaveEdit}
        departments={departments}
        departmentTypes={departmentTypes}
        doctors={doctors}
        isLoadingDoctors={isLoadingDoctors}
        isSaving={isSaving}
        onDepartmentChange={handleDepartmentChange}
        onDepartmentTypeChange={handleDepartmentTypeChange}
        onDoctorChange={handleDoctorChange}
      />
    </div>
  );
}
