import { useState, useEffect, useRef, useCallback } from "react";
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
import { UserPlus, Search, Printer, LoaderCircle, User } from "lucide-react";
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
import { diseaseService } from "../../services/disease.service"; // Import diseaseService
import { useUserStore } from "../../stores/user.store";

interface Patient {
  id: number;
  name: string;
  last_name: string;
  gender: "e" | "a";
  birth_date: string;
  phone_number: string;
  address: string;
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

interface ReceiptData {
  queueNumber?: number;
  firstName: string;
  lastName: string;
  department: string;
  doctorName?: string;
  registrationDate: string;
  paymentAmount?: number;
}

// Updated to handle data from search results
const toPatientForm = (data: Patient) => ({
  id: data.id,
  firstName: data.name,
  lastName: data.last_name,
  gender: data.gender,
  birthDate: data.birth_date,
  phone: data.phone_number.replace("+998", ""), // Remove country code for form input
  address: data.address,
});

export function PatientRegistration() {
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const { user } = useUserStore();

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mode, setMode] = useState<"types" | "doctors" | null>(null);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Removed initial patient fetching, now only fetches departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentData, departmentTypeData] = await Promise.all([
          departmentService.findAll(),
          departmentTypeService.findAll(),
        ]);
        setDepartments(departmentData.results || departmentData);
        setDepartmentTypes(departmentTypeData.results || departmentTypeData);
      } catch (error) {
        toast.error("Bo'lim ma'lumotlarini yuklashda xatolik");
      }
    };

    fetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "e" as "e" | "a",
    birthDate: "",
    phone: "",
    address: "",
    diseaseType: "",
    departmentId: user?.department,
    departmentTypeId: 0,
    doctorId: 0,
  });

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.info("Qidiruv uchun ma'lumot kiriting");
      return;
    }
    setIsSearching(true);
    setSelectedPatient(null); // Clear previous selection
    try {
      const results = await patientService.searchPatient(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
        toast.success(`${results.length} ta bemor topildi`);
      } else {
        setSearchResults([]);
        toast.info("Bemor topilmadi. Yangi bemor sifatida ro'yxatdan o'ting.");
      }
    } catch (error) {
      toast.error("Qidiruvda xatolik yuz berdi");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    const patientFormData = toPatientForm(patient);
    setFormData({
      ...formData,
      firstName: patientFormData.firstName,
      lastName: patientFormData.lastName,
      gender: patientFormData.gender,
      birthDate: patientFormData.birthDate,
      phone: patientFormData.phone,
      address: patientFormData.address,
      // Reset medical info for the new visit
      diseaseType: "",
      departmentId: 0,
      departmentTypeId: 0,
      doctorId: 0,
    });
    setSearchResults([]); // Hide search results after selection
    toast.success(`${patient.name} ${patient.last_name} tanlandi.`);
  };

  useEffect(() => {
    const setupDepartmentData = async () => {
      if (user?.department && departments.length > 0) {
        const department = departments.find((d) => d.id === user.department);
        if (!department) return;

        setFormData((fd) => ({ ...fd, departmentId: user.department }));

        if (
          department.department_types &&
          department.department_types.length > 0
        ) {
          setMode("types");
        } else {
          setMode("doctors");
          setIsLoadingDoctors(true);
          try {
            if (!user?.department) {
              toast.error("Error", {
                description: "Tizimga Labarant sifatida qayta kiring!",
              });
              return;
            }
            const doctorsData = await departmentService.findDoctorsByDepartment(
              user?.department
            );
            setDoctors(doctorsData.results || doctorsData || []);
          } catch (error) {
            toast.error("Shifokorlarni yuklashda xatolik");
          } finally {
            setIsLoadingDoctors(false);
          }
        }
      }
    };
    setupDepartmentData();
  }, [user, departments]);

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
    setIsSubmitting(true);

    let patientId: number;

    try {
      // Step 1: Ensure we have a patient ID
      if (selectedPatient) {
        patientId = selectedPatient.id;
      } else {
        if (!user?.department) {
          toast.error("Error", {
            description: "Tizimga Labarant sifatida qayta kiring!",
          });
          return;
        }
        const newPatientDto = {
          name: formData.firstName,
          last_name: formData.lastName,
          middle_name: "",
          gender: formData.gender,
          birth_date: formData.birthDate,
          phone_number: `+998${formData.phone}`,
          address: formData.address,
          disease: formData.diseaseType,
          disease_uz: formData.diseaseType,
          disease_ru: formData.diseaseType,
          department: user?.department,
          department_types: formData.departmentTypeId || undefined,
          user: formData.doctorId || undefined,
        };
        const newPatientData = await patientService.create(newPatientDto);
        patientId = newPatientData.id;
        toast.success("Yangi bemor muvaffaqiyatli yaratildi!");
      }

      // Step 2: Create a disease/visit record for the patient
      const diseaseDto = {
        disease: formData.diseaseType,
        patient: patientId,
        department: user?.department ?? 1,
        department_types: formData.departmentTypeId || undefined,
        user: formData.doctorId || undefined,
      };

      const newDiseaseData = await diseaseService.create(diseaseDto);

      // Step 3: Prepare and show receipt
      const doctor = doctors.find((d) => d.id === formData.doctorId);
      const department = departments.find(
        (d) => d.id === formData.departmentId
      );
      const departmentType = departmentTypes.find(
        (dt) => dt.id === formData.departmentTypeId
      );

      let paymentAmount = 0;
      if (departmentType) {
        paymentAmount = departmentType.price;
      } else if (doctor) {
        paymentAmount = parseInt(doctor.price, 10);
      }

      setReceiptData({
        firstName: selectedPatient?.name || formData.firstName,
        lastName: selectedPatient?.last_name || formData.lastName,
        department: department?.title || "",
        doctorName: doctor?.full_name,
        queueNumber: newDiseaseData.queue_number, // Assuming disease create returns queue_number
        registrationDate: new Date().toISOString(),
        paymentAmount,
      });

      setShowReceipt(true);
      toast.success("Bemor tashrifi muvaffaqiyatli ro'yxatga olindi!");

      // Reset form completely
      setFormData({
        firstName: "",
        lastName: "",
        gender: "e",
        birthDate: "",
        phone: "",
        address: "",
        diseaseType: "",
        departmentId: user?.department,
        departmentTypeId: 0,
        doctorId: 0,
      });
      setSelectedPatient(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      toast.error("Ro'yxatga olishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredDepartmentTypes = departmentTypes.filter(
    (type) => type.department === formData.departmentId
  );

  const userDepartmentName =
    departments.find((d) => d.id === user?.department)?.title ||
    "Yuklanmoqda...";

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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Qidirish
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Qidiruv natijalari:</h4>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {searchResults.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {patient.name} {patient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.phone_number}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedPatient && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p>
                ✓ Bemor tanlandi: {selectedPatient.name}{" "}
                {selectedPatient.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {selectedPatient.id}
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
            <fieldset disabled={isSubmitting} className="space-y-6">
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
                  <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm shadow-sm">
                    <span className="px-3 text-muted-foreground">+998</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="901234567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      disabled={!!selectedPatient}
                      maxLength={9}
                      className="h-auto flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
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
                      Kasallik turi / Shikoyat
                    </Label>
                    <Textarea
                      id="diseaseType"
                      value={formData.diseaseType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diseaseType: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Bo'lim *</Label>
                      <Input readOnly value={userDepartmentName} />
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
                                {type.title}
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
                                  )?.title
                                }
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
                                  doctors.find(
                                    (d) => d.id === formData.doctorId
                                  )?.full_name
                                }
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">
                                Ko'rik narxi:
                              </span>{" "}
                              <span className="font-medium">
                                {
                                  doctors.find(
                                    (d) => d.id === formData.doctorId
                                  )?.price
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
            </fieldset>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
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
