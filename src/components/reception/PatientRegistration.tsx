import { useState, useEffect } from "react";
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
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { toast } from "sonner";
import { UserPlus, Search, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { patientService } from "../../services/patient.service";
import { departmentService } from "../../services/department.service";
import { departmentTypeService } from "../../services/department-type.service";

// Define types locally
interface PatientHistory {
  id: number;
  date: string;
  type: "registration" | "lab-test" | "consultation" | "payment" | "other";
  description: string;
  doctorName?: string;
  department?: string;
  amount?: number;
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
  departmentType?: string;
  doctorId?: number;
  doctorName?: string;
  paymentAmount?: number;
  queueNumber?: number;
  registrationDate: string;
  history: PatientHistory[];
}

interface Doctor {
  id: number;
  full_name: string;
  price: string;
}

interface Department {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department_types: DepartmentType[];
}

interface DepartmentType {
  id: number;
  title: string;
  title_ru: string;
  title_uz: string;
  department: number;
  price: number;
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
  department: data.department?.title_uz || "",
  departmentId: data.department?.id,
  departmentTypeId: data.department_types,
  departmentType: "",
  doctorId: data.user,
  doctorName: "",
  paymentAmount: 0,
  registrationDate: new Date().toISOString(),
  history: [],
});

export function PatientRegistration() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);

  const [mode, setMode] = useState<"types" | "doctors" | null>(null);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientData, departmentData, departmentTypeData] =
          await Promise.all([
            patientService.findAll(),
            departmentService.findAll(),
            departmentTypeService.findAll(),
          ]);
        setPatients((patientData.results || patientData).map(toPatient));
        setDepartments(departmentData.results || departmentData);
        setDepartmentTypes(departmentTypeData.results || departmentTypeData);
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      }
    };

    fetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "e" as "e" | "a",
    birthDate: "",
    phone: "",
    address: "",
    diseaseType: "",
    departmentId: 0,
    departmentTypeId: 0,
    doctorId: 0,
  });

  const handleSearch = () => {
    const found = patients.find(
      (p) =>
        p.phone.includes(searchQuery) ||
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedPatient(found);
      setFormData({
        ...formData,
        firstName: found.firstName,
        lastName: found.lastName,
        gender: found.gender,
        birthDate: found.birthDate,
        phone: found.phone,
        address: found.address,
        diseaseType: "",
        departmentId: 0,
        departmentTypeId: 0,
        doctorId: 0,
      });
      toast.success("Bemor topildi!");
    } else {
      toast.error("Bemor topilmadi");
      setSelectedPatient(null);
    }
  };

  const handleDepartmentChange = async (value: string) => {
    const departmentId = parseInt(value, 10);
    const department = departments.find((d) => d.id === departmentId);

    setFormData({
      ...formData,
      departmentId: departmentId,
      departmentTypeId: 0,
      doctorId: 0,
    });
    setDoctors([]);
    setMode(null);

    if (!department) return;

    if (department.department_types && department.department_types.length > 0) {
      setMode("types");
    } else {
      setMode("doctors");
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
    }
  };

  const handleDepartmentTypeChange = (value: string) => {
    setFormData({
      ...formData,
      departmentTypeId: parseInt(value, 10),
    });
  };

  const handleDoctorChange = (value: string) => {
    setFormData({
      ...formData,
      doctorId: parseInt(value, 10),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctor = doctors.find((d) => d.id === formData.doctorId);
    const departmentType = departmentTypes.find(
      (dt) => dt.id === formData.departmentTypeId
    );

    let paymentAmount = 0;
    if (departmentType) {
      paymentAmount = departmentType.price;
    } else if (doctor) {
      paymentAmount = parseInt(doctor.price, 10);
    }

    const dto = {
      user: formData.doctorId || undefined, // Assign doctorId if selected, otherwise undefined
      department: formData.departmentId,
      department_types: formData.departmentTypeId || undefined,
      name: formData.firstName,
      last_name: formData.lastName,
      middle_name: "",
      gender: formData.gender,
      birth_date: formData.birthDate,
      phone_number: formData.phone,
      address: formData.address,
      disease: formData.diseaseType,
      disease_uz: formData.diseaseType,
      disease_ru: formData.diseaseType,
    };

    try {
      const newPatientData = await patientService.create(dto);
      const newPatient = toPatient(newPatientData);

      setPatients((prev) => [...prev, newPatient]);
      setReceiptData(newPatient);
      setShowReceipt(true);
      toast.success("Bemor muvaffaqiyatli ro'yxatga olindi!");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        gender: "e",
        birthDate: "",
        phone: "",
        address: "",
        diseaseType: "",
        departmentId: 0,
        departmentTypeId: 0,
        doctorId: 0,
      });
      setSelectedPatient(null);
      setSearchQuery("");
    } catch (error) {
      toast.error("Bemor ro'yxatga olishda xatolik");
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredDepartmentTypes = departmentTypes.filter(
    (type) => type.department === formData.departmentId
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Bemor ro'yxatga olish</h1>
        <p className="text-muted-foreground">
          Yangi bemor qo'shish yoki mavjud bemorni qidirish
        </p>
      </div>

      {/* Search Existing Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Mavjud bemorni qidirish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Telefon raqam yoki ism-familiya"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Qidirish
            </Button>
          </div>
          {selectedPatient && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p>
                ✓ Bemor topildi: {selectedPatient.firstName}{" "}
                {selectedPatient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                Kasallik tarixi: {selectedPatient.history?.length || 0} ta
                tashriflar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <UserPlus className="w-5 h-5 inline mr-2" />
            {selectedPatient
              ? "Yangi tashrifni ro'yxatga olish"
              : "Yangi bemor ro'yxatga olish"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  disabled={!!selectedPatient}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  disabled={!!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jinsi *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value: "e" | "a") =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={!!selectedPatient}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="e" id="e" />
                  <Label htmlFor="e">Erkak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a" id="a" />
                  <Label htmlFor="a">Ayol</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tug'ilgan sana *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  required
                  disabled={!!selectedPatient}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqami *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  disabled={!!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Manzil *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                disabled={!!selectedPatient}
              />
            </div>

            {/* Medical Information */}
            <div className="border-t pt-6">
              <h3 className="mb-4">Tibbiy ma'lumotlar</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diseaseType">
                    Kasallik turi / Shikoyat *
                  </Label>
                  <Textarea
                    id="diseaseType"
                    value={formData.diseaseType}
                    onChange={(e) =>
                      setFormData({ ...formData, diseaseType: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Bo'lim *</Label>
                    <Select
                      value={
                        formData.departmentId === 0
                          ? ""
                          : formData.departmentId.toString()
                      }
                      onValueChange={handleDepartmentChange}
                      required
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

                  {mode === "types" && (
                    <div className="space-y-2">
                      <Label htmlFor="departmentType">Bo'lim turi *</Label>
                      <Select
                        value={
                          formData.departmentTypeId === 0
                            ? ""
                            : formData.departmentTypeId.toString()
                        }
                        onValueChange={handleDepartmentTypeChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bo'lim turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDepartmentTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.title_uz} -{" "}
                              {Number(type.price).toLocaleString()} so'm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.departmentTypeId && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Tanlangan bo'lim turi:
                            </span>{" "}
                            <span className="font-medium">
                              {
                                filteredDepartmentTypes.find(
                                  (t) => t.id === formData.departmentTypeId
                                )?.title_uz
                              }
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Narx:</span>{" "}
                            <span className="font-medium">
                              {filteredDepartmentTypes
                                .find((t) => t.id === formData.departmentTypeId)
                                ?.price.toLocaleString()}{" "}
                              so'm
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "doctors" && (
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Shifokor *</Label>
                      <Select
                        value={
                          formData.doctorId === 0
                            ? ""
                            : formData.doctorId.toString()
                        }
                        onValueChange={handleDoctorChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Shifokorni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id.toString()}
                            >
                              {doctor.full_name} - {doctor.price} so'm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.doctorId && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Tanlangan shifokor:
                            </span>{" "}
                            <span className="font-medium">
                              {
                                doctors.find((d) => d.id === formData.doctorId)
                                  ?.full_name
                              }
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Ko'rik narxi:
                            </span>{" "}
                            <span className="font-medium">
                              {
                                doctors.find((d) => d.id === formData.doctorId)
                                  ?.price
                              }{" "}
                              so'm
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Ro'yxatga olish va check chiqarish
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Qabul check</DialogTitle>
            <DialogDescription>
              Bemorning ro'yxatga olish cheki
            </DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 print:p-8">
              <div className="text-center border-b pb-4">
                <h2>KLINIKA BOSHQARUV TIZIMI</h2>
                <p className="text-muted-foreground">Qabul check</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Navbat raqami:</span>
                  <span>{receiptData.queueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bemor:</span>
                  <span>
                    {receiptData.firstName} {receiptData.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bo'lim:</span>
                  <span>{receiptData.department}</span>
                </div>
                {receiptData.doctorName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shifokor:</span>
                    <span>{receiptData.doctorName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sana:</span>
                  <span>
                    {new Date(receiptData.registrationDate).toLocaleString(
                      "uz-UZ"
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">To'lov miqdori:</span>
                  <span>
                    {receiptData.paymentAmount?.toLocaleString()} so'm
                  </span>
                </div>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-center">
                    To'lovni kassadan amalga oshiring
                  </p>
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
