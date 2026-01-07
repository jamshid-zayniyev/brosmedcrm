import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  TestTube,
  Upload,
  BarChart3,
  FileText,
  User,
  Plus,
  Loader2,
  Search,
  LoaderCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Patient } from "../../interfaces/patient.interface";
import { DepartmentType } from "../../interfaces/department-type.interface";
import { labService } from "../../services/lab.service";
import { departmentTypeService } from "../../services/department-type.service";
import { patientService } from "../../services/patient.service";
import { analysisResultService } from "../../services/analysis-result.service";
import { AnalysisResultPayload } from "../../interfaces/analysis-result.interface";

export function TestResults() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<
    AnalysisResultPayload[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, departmentTypesRes] = await Promise.all([
          patientService.findAll(),
          departmentTypeService.findAll(),
        ]);
        setPatients(patientsRes);
        setDepartmentTypes(departmentTypesRes);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    departmentTypeId: "",
    status: "n" as "n" | "ip" | "f",
  });

  const handleDepartmentTypeChange = (value: string) => {
    setFormData({ ...formData, departmentTypeId: value });
    const selectedType = departmentTypes.find(
      (dt) => dt.id.toString() === value
    );
    if (selectedType && selectedType.result) {
      const initialResults = selectedType.result.map((res) => ({
        result: res.id,
        analysis_result: "",
        patient: parseInt(selectedPatient) || 0, // Add patient ID
      }));
      setAnalysisResults(initialResults);
    } else {
      setAnalysisResults([]);
    }
  };

  const handleResultChange = (resultId: number, value: string) => {
    setAnalysisResults((prev) =>
      prev.map((res) =>
        res.result === resultId ? { ...res, analysis_result: value } : res
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !formData.departmentTypeId) {
      toast.error("Bemor va tahlil turini tanlang");
      return;
    }

    const patient = patients.find((p) => p.id.toString() === selectedPatient);
    const departmentType = departmentTypes.find(
      (dt) => dt.id.toString() === formData.departmentTypeId
    );

    if (!patient || !departmentType) {
      toast.error("Bemor yoki tahlil turi topilmadi");
      return;
    }
    
    setIsSubmitting(true); // Set submitting to true

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

      const updatedPatients = await patientService.findAll();
      setPatients(updatedPatients);

      toast.success("Tahlil va uning natijalari muvaffaqiyatli saqlandi");

      setFormData({ departmentTypeId: "", status: "n" });
      setAnalysisResults([]);
      setFiles([]);
      setSelectedPatient("");
    } catch (error) {
      console.error("Tahlil yaratishda xatolik:", error);
      toast.error("Tahlil yaratishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false); // Set submitting to false
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
      toast.success(`${selectedFiles.length} ta fayl tanlandi`);
    }
  };

  // const getStatusBadge = (status: string) => {
  //   const statusConfig: Record<string, { label: string; className: string }> = {
  //     n: {
  //       label: "Yangi",
  //       className: "bg-blue-50 text-blue-700 border border-blue-200",
  //     },
  //     ip: {
  //       label: "Jarayonda",
  //       className: "bg-amber-50 text-amber-700 border border-amber-200",
  //     },
  //     f: {
  //       label: "Yakunlangan",
  //       className: "",
  //     },
  //     r: {
  //       label: "Kutmoqda",
  //       className: "bg-gray-50 text-gray-700 border border-gray-200",
  //     },
  //     l: {
  //       label: "Laboratoriyada",
  //       className: "bg-purple-50 text-purple-700 border border-purple-200",
  //     },
  //     d: {
  //       label: "Doktorda",
  //       className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  //     },
  //     t: {
  //       label: "To'lovda",
  //       className: "bg-pink-50 text-pink-700 border border-pink-200",
  //     },
  //     rc: {
  //       label: "Ro'yxatdan o'chirilgan",
  //       className: "bg-red-50 text-red-700 border border-red-200",
  //     },
  //   };
  //   return (
  //     statusConfig[status] || {
  //       label: status,
  //       className: "bg-gray-50 text-gray-700 border border-gray-200",
  //     }
  //   );
  // };

  const registeredPatients = patients.filter(
    (p) => p.patient_status === "r" || p.patient_status === "l"
  );

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.info("Qidiruv uchun ma'lumot kiriting");
      return;
    }
    setIsSearching(true);
    try {
      const results = await patientService.searchPatient(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
        toast.success(`${results.length} ta bemor topildi`);
      } else {
        setSearchResults([]);
        toast.info("Bemor topilmadi.");
      }
    } catch (error) {
      toast.error("Qidiruvda xatolik yuz berdi");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    navigate(`/lab/patient-analysis/${patient.id}`);
  };

  const handleReset = async () => {
    setLoading(true);
    setSearchQuery("");
    setSearchResults([]);
    try {
      const patientsRes = await patientService.findAll();
      setPatients(patientsRes);
    } catch (error) {
      toast.error("Bemorlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const patientsToDisplay = searchResults.length > 0 ? searchResults : patients;

  if (loading) {
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
                    <Select
                      value={selectedPatient}
                      onValueChange={setSelectedPatient}
                      required
                    >
                      <SelectTrigger className="bg-white border-gray-200 h-10">
                        <SelectValue placeholder="Bemorni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredPatients.map((patient) => (
                          <SelectItem
                            key={patient.id}
                            value={patient.id.toString()}
                          >
                            {patient.name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="departmentType"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Tahlil turi *
                    </Label>
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
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          (dt) => dt.id.toString() === formData.departmentTypeId
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
                                  (r) => r.result === resItem.id
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
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          <Card>
            <CardHeader>
              <CardTitle>Bemorlarni qidirish</CardTitle>
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
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {patientsToDisplay.map((patient) => (
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
                        ID: <span className="font-medium">{patient.id}</span> •
                        Ro'yxatga olindi:{" "}
                        <span className="font-medium">
                          {new Date(patient.created_at).toLocaleDateString()}
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

                    <div className="mt-4">
                      <Button
                        onClick={() => handlePatientSelect(patient)}
                      >
                        Analizlarni ko'rish
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
