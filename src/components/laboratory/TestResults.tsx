import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  TestTube,
  Upload,
  BarChart3,
  FileText,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Pencil,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Patient } from "../../interfaces/patient.interface";
import { DepartmentType } from "../../interfaces/department-type.interface";
import { labService } from "../../services/lab.service";
import { departmentTypeService } from "../../services/department-type.service";
import { patientService } from "../../services/patient.service";
import { analysisResultService } from "../../services/analysis-result.service";
import { AnalysisResultPayload } from "../../interfaces/analysis-result.interface";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function TestResults() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentTypesLoading, setDepartmentTypesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search filter for patients list tab
  const [listSearchQuery, setListSearchQuery] = useState("");
  const [isListSearching, setIsListSearching] = useState(false);

  const [analysisResults, setAnalysisResults] = useState<
    AnalysisResultPayload[]
  >([]);

  // New analysis tab - patient search states
  const [patientsForSelect, setPatientsForSelect] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [openPatientSelect, setOpenPatientSelect] = useState(false);

  // --- Edit patient dialog states ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ name: "", last_name: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch department types only once on mount
  useEffect(() => {
    const fetchDepartmentTypes = async () => {
      try {
        const departmentTypesRes = await departmentTypeService.findAll();
        setDepartmentTypes(departmentTypesRes);
      } catch (error) {
        console.error("Department types yuklashda xatolik:", error);
        toast.error("Tahlil turlarini yuklashda xatolik yuz berdi");
      } finally {
        setDepartmentTypesLoading(false);
      }
    };

    fetchDepartmentTypes();
  }, []);

  // Fetch initial patients for select (first 10)
  useEffect(() => {
    const fetchInitialPatients = async () => {
      try {
        setLoading(true);
        const response = await patientService.findAll({ page: 1, limit: 10 });
        setPatientsForSelect(response.data || []);
      } catch (error) {
        console.error("Bemorlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPatients();
  }, []);

  // Fetch patients when page changes or search query changes (for list tab)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        let response;

        if (listSearchQuery.trim() === "") {
          // Normal pagination
          response = await patientService.findAll({ page, limit });
          setPatients(response.data || []);
          setTotalCount(response.total || 0);
          setTotalPages(response.total_pages || 1);
        } else {
          // Search mode
          setIsListSearching(true);
          const searchResults =
            await patientService.searchPatient(listSearchQuery);
          setPatients(searchResults || []);
          setTotalCount(searchResults?.length || 0);
          setTotalPages(1); // Search results in single page
        }
      } catch (error) {
        console.error("Bemorlarni yuklashda xatolik:", error);
        toast.error("Bemorlarni yuklashda xatolik yuz berdi");
        setPatients([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsListSearching(false);
      }
    };

    const debounceTimer = setTimeout(
      () => {
        fetchPatients();
      },
      listSearchQuery.trim() === "" ? 0 : 300,
    ); // No debounce for empty, 300ms for search

    return () => clearTimeout(debounceTimer);
  }, [page, limit, listSearchQuery]);

  // Search patients with debounce
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.trim() === "") {
        // If search is empty, load initial 10 patients
        try {
          const response = await patientService.findAll({ page: 1, limit: 10 });
          setPatientsForSelect(response.data || []);
        } catch (error) {
          console.error("Bemorlarni yuklashda xatolik:", error);
        }
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await patientService.searchPatient(searchQuery);
        setPatientsForSelect(searchResults || []);
      } catch (error) {
        console.error("Qidirishda xatolik:", error);
        setPatientsForSelect([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    setOpenPatientSelect(false);
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departmentTypeId: "",
    status: "n" as "n" | "ip" | "f",
  });

  const handleDepartmentTypeChange = (value: string) => {
    setFormData({ ...formData, departmentTypeId: value });
    const selectedType = departmentTypes.find(
      (dt) => dt.id.toString() === value,
    );
    if (selectedType && selectedType.result) {
      const initialResults = selectedType.result.map((res) => ({
        result: res.id,
        analysis_result: "",
        patient: parseInt(selectedPatient) || 0,
      }));
      setAnalysisResults(initialResults);
    } else {
      setAnalysisResults([]);
    }
  };

  const handleResultChange = (resultId: number, value: string) => {
    setAnalysisResults((prev) =>
      prev.map((res) =>
        res.result === resultId ? { ...res, analysis_result: value } : res,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !formData.departmentTypeId) {
      toast.error("Bemor va tahlil turini tanlang");
      return;
    }

    const patient = patientsForSelect.find(
      (p) => p.id.toString() === selectedPatient,
    );
    const departmentType = departmentTypes.find(
      (dt) => dt.id.toString() === formData.departmentTypeId,
    );

    if (!patient || !departmentType) {
      toast.error("Bemor yoki tahlil turi topilmadi");
      return;
    }

    setIsSubmitting(true);
    try {
      const analysisFormData = new FormData();
      analysisFormData.append("patient", patient.id.toString());
      analysisFormData.append("department_types", departmentType.id.toString());
      analysisFormData.append("status", formData.status);
      if (files.length > 0) {
        files.forEach((file) => {
          analysisFormData.append("files", file);
        });
      }
      const newAnalysis = await labService.createAnalysis(analysisFormData);

      const resultsWithAnalysisId = analysisResults.map((res) => ({
        ...res,
        analysis: newAnalysis.id,
      }));
      await analysisResultService.create(resultsWithAnalysisId);

      const response = await patientService.findAll({ page, limit });
      setPatients(response.data || []);

      toast.success("Tahlil va uning natijalari muvaffaqiyatli saqlandi");

      setFormData({ departmentTypeId: "", status: "n" });
      setAnalysisResults([]);
      setFiles([]);
      setSelectedPatient("");
      setSearchQuery("");
    } catch (error) {
      console.error("Tahlil yaratishda xatolik:", error);
      toast.error("Tahlil yaratishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
      toast.success(`${selectedFiles.length} ta fayl tanlandi`);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleListSearchChange = (value: string) => {
    setListSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };

  // --- Edit patient handlers ---
  const handleOpenEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setEditForm({ name: patient.name, last_name: patient.last_name });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field: "name" | "last_name", value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    if (!editForm.name.trim() || !editForm.last_name.trim()) {
      toast.error("Ism va familya bo'sh bo'lishi mumkin emas");
      return;
    }

    setIsUpdating(true);
    try {
      await patientService.update({
        id: editingPatient.id,
        name: editForm.name.trim(),
        last_name: editForm.last_name.trim(),
      });

      // Update patient in local state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingPatient.id
            ? {
                ...p,
                name: editForm.name.trim(),
                last_name: editForm.last_name.trim(),
              }
            : p,
        ),
      );

      toast.success("Bemor ma'lumotlari muvaffaqiyatli yangilandi");
      setEditDialogOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Bemorni yangilashda xatolik:", error);
      toast.error("Bemorni yangilashda xatolik yuz berdi");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(1)}
        >
          1
        </Button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(i)}
        >
          {i}
        </Button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>,
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={totalPages === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(totalPages)}
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  const registeredPatientsForSelect = patientsForSelect.filter(
    (p) => p.patient_status === "r" || p.patient_status === "l",
  );

  if (loading && page === 1) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-80 mb-3" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-56" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-5 w-80" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- Edit Patient Dialog --- */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          style={{
            maxWidth: "460px",
            borderRadius: "16px",
            padding: "32px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
          }}
        >
          <DialogHeader style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  padding: "10px",
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil
                  style={{ width: "20px", height: "20px", color: "#2563eb" }}
                />
              </div>
              <DialogTitle
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Bemor ma'lumotlarini yangilash
              </DialogTitle>
            </div>
            {editingPatient && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginLeft: "44px",
                  marginTop: "2px",
                }}
              >
                ID: {editingPatient.id} • Hozirgi:{" "}
                <span style={{ fontWeight: "600", color: "#374151" }}>
                  {editingPatient.name} {editingPatient.last_name}
                </span>
              </p>
            )}
          </DialogHeader>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Name field */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Label
                htmlFor="edit-name"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  letterSpacing: "0.01em",
                }}
              >
                Ism <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => handleEditFormChange("name", e.target.value)}
                placeholder="Ismni kiriting..."
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "15px",
                  padding: "0 14px",
                  background: "#ffffff",
                  transition: "border-color 0.2s",
                  outline: "none",
                  color: "#111827",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Last name field */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Label
                htmlFor="edit-last-name"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  letterSpacing: "0.01em",
                }}
              >
                Familya <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                id="edit-last-name"
                value={editForm.last_name}
                onChange={(e) =>
                  handleEditFormChange("last_name", e.target.value)
                }
                placeholder="Familyani kiriting..."
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "15px",
                  padding: "0 14px",
                  background: "#ffffff",
                  transition: "border-color 0.2s",
                  outline: "none",
                  color: "#111827",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <DialogFooter style={{ marginTop: "28px", gap: "10px" }}>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingPatient(null);
              }}
              disabled={isUpdating}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                border: "1.5px solid #e5e7eb",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleUpdatePatient}
              disabled={isUpdating}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                background: isUpdating
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                border: "none",
                cursor: isUpdating ? "not-allowed" : "pointer",
                boxShadow: isUpdating
                  ? "none"
                  : "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isUpdating ? (
                <>
                  <Loader2
                    style={{
                      width: "16px",
                      height: "16px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Pencil style={{ width: "16px", height: "16px" }} />
                  Saqlash
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TestTube className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tahlillar va tekshiruvlar
          </h1>
        </div>
        <p className="text-gray-600 text-base">
          Bemorlar uchun tahlil natijalarini kiriting va tahlil qiling
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1">
          <TabsTrigger
            style={{
              height: "120px",
            }}
            value="list"
          >
            Barcha bemorlar
          </TabsTrigger>
          <TabsTrigger
            style={{
              height: "120px",
            }}
            value="new"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yangi tahlil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TestTube className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Yangi tahlil kiritish</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="patient"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Bemorni tanlang *
                    </Label>
                    <Popover
                      open={openPatientSelect}
                      onOpenChange={setOpenPatientSelect}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPatientSelect}
                          className="w-full justify-between bg-white border-gray-200 h-10"
                        >
                          {selectedPatient
                            ? (() => {
                                const patient =
                                  registeredPatientsForSelect.find(
                                    (p) => p.id.toString() === selectedPatient,
                                  );
                                return patient
                                  ? `${patient.name} ${patient.last_name}`
                                  : "Bemorni tanlang";
                              })()
                            : "Bemorni tanlang"}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        style={{
                          height: "380px",
                        }}
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Bemorni qidirish..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            {isSearching ? (
                              <div className="p-4 text-sm text-center text-muted-foreground">
                                Qidirilmoqda...
                              </div>
                            ) : registeredPatientsForSelect.length === 0 ? (
                              <CommandEmpty>Bemor topilmadi</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {registeredPatientsForSelect.map((patient) => (
                                  <CommandItem
                                    key={patient.id}
                                    value={patient.id.toString()}
                                    keywords={[
                                      patient.name,
                                      patient.last_name,
                                      patient.phone_number,
                                    ]}
                                    onSelect={(currentValue: string) => {
                                      handlePatientSelect(currentValue);
                                    }}
                                  >
                                    <div className="flex items-center gap-2 w-full cursor-pointer">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name} ${patient.last_name}`}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {patient.name.charAt(0)}
                                          {patient.last_name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {patient.name} {patient.last_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {patient.phone_number}
                                        </div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="departmentType"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Tahlil turi *
                    </Label>
                    {departmentTypesLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={formData.departmentTypeId}
                        onValueChange={handleDepartmentTypeChange}
                        required
                      >
                        <SelectTrigger className="bg-white border-gray-200 h-10">
                          <SelectValue placeholder="Tahlil turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {analysisResults.length > 0 && (
                  <Card className="border-blue-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Natijalarni kiritish
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {departmentTypes
                        .find(
                          (dt) =>
                            dt.id.toString() === formData.departmentTypeId,
                        )
                        ?.result.map((resItem) => (
                          <div
                            key={resItem.id}
                            className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-3 bg-white rounded-lg border border-blue-100"
                          >
                            <Label
                              htmlFor={`result-${resItem.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {resItem.title}
                            </Label>
                            <Input
                              id={`result-${resItem.id}`}
                              value={
                                analysisResults.find(
                                  (r) => r.result === resItem.id,
                                )?.analysis_result || ""
                              }
                              onChange={(e) =>
                                handleResultChange(resItem.id, e.target.value)
                              }
                              placeholder="Natija kiriting..."
                              className="border-gray-200 focus:border-primary"
                            />
                            <span className="text-sm text-gray-600">
                              Norma:{" "}
                              <span className="font-semibold text-gray-900">
                                {resItem.norma}
                              </span>
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Status *
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "n" | "ip" | "f") =>
                        setFormData({ ...formData, status: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-white border-gray-200 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="n">Yangi</SelectItem>
                        <SelectItem value="ip">Jarayonda</SelectItem>
                        <SelectItem value="f">Yakunlangan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="files"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Fayllar (ixtiyoriy)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors rounded-lg p-8 text-center bg-gradient-to-br from-gray-50 to-white">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="files" className="cursor-pointer">
                      <span className="text-primary font-semibold">
                        Fayl tanlash
                      </span>
                      <span className="text-gray-600">
                        {" "}
                        yoki bu yerga tashlang
                      </span>
                    </Label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Tanlangan fayllar:
                      </p>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5 mr-2" />
                      Tahlilni saqlash
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Jami bemorlar: {totalCount} ta
            </p>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Bemorni qidirish..."
                value={listSearchQuery}
                onChange={(e) => handleListSearchChange(e.target.value)}
                className="pl-9 bg-white border-gray-200"
              />
              {isListSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {isListSearching || loading ? (
            <div className="space-y-3">
              {[...Array(limit)].map((_, i) => (
                <Card key={i} className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Internetni tekshiring!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {patients.map((patient) => (
                  <AccordionItem
                    value={`item-${patient.id}`}
                    key={patient.id}
                    className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                      <div className="flex items-center gap-4 w-full">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name} ${patient.last_name}`}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {patient.name.charAt(0)}
                            {patient.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 text-base">
                            {patient.name} {patient.last_name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ID:{" "}
                            <span className="font-medium">{patient.id}</span> •
                            Ro'yxatga olindi:{" "}
                            <span className="font-medium">
                              {new Date(
                                patient.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-6 py-8">
                        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/30">
                          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-t-lg border-b border-blue-100">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              Bemor ma'lumotlari
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                  <span className="text-sm font-medium text-gray-600">
                                    Jinsi:
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 px-2 py-1 rounded bg-gray-50">
                                  {patient.gender === "e" ? "Erkak" : "Ayol"}
                                </span>
                              </div>

                              <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  <span className="text-sm font-medium text-gray-600">
                                    Tug'ilgan sana:
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 px-2 py-1 rounded bg-gray-50">
                                  {patient.birth_date}
                                </span>
                              </div>

                              <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                  <span className="text-sm font-medium text-gray-600">
                                    Telefon:
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 px-2 py-1 rounded bg-gray-50">
                                  {patient.phone_number}
                                </span>
                              </div>

                              <div className="col-span-full flex justify-between items-start p-3 rounded-lg bg-white border border-gray-100 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                  <span className="text-sm font-medium text-gray-600">
                                    Manzil:
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 text-right max-w-[70%] px-2 py-1 rounded bg-gray-50">
                                  {patient.address}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Action buttons */}
                        <div className="mt-4 flex items-center gap-3">
                          <Button
                            onClick={() =>
                              navigate(`/lab/patient-analysis/${patient.id}`)
                            }
                          >
                            Analizlarni ko'rish
                          </Button>

                          <Button
                            variant="outline"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.stopPropagation();
                              handleOpenEditDialog(patient);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              height: "36px",
                              paddingLeft: "14px",
                              paddingRight: "14px",
                              borderRadius: "8px",
                              border: "1.5px solid #e5e7eb",
                              background: "#ffffff",
                              color: "#2563eb",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.currentTarget.style.background = "#eff6ff";
                              e.currentTarget.style.borderColor = "#93c5fd";
                            }}
                            onMouseLeave={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.currentTarget.style.background = "#ffffff";
                              e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                          >
                            <Pencil style={{ width: "14px", height: "14px" }} />
                            Ma'lumotlarni yangilash
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Pagination - only show when not searching */}
              {totalPages > 1 && listSearchQuery.trim() === "" && (
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Sahifa {page} / {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Oldingi
                        </Button>

                        <div className="hidden md:flex items-center gap-1">
                          {renderPageNumbers()}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={page === totalPages}
                        >
                          Keyingi
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
