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
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  TestTube,
  Upload,
  BarChart3,
  Edit,
  FileText,
  User,
  Eye,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Patient } from "../../interfaces/patient.interface";
import { Analysis } from "../../interfaces/analysis.interface";
import { DepartmentType } from "../../interfaces/department-type.interface";
import { labService } from "../../services/lab.service";
import { departmentTypeService } from "../../services/department-type.service";
import { patientService } from "../../services/patient.service";
import { analysisResultService } from "../../services/analysis-result.service";
import { AnalysisResultPayload } from "../../interfaces/analysis-result.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function EditAnalysisDialog({
  analysis,
  onSave,
  onClose,
  onStatusUpdate,
}: {
  analysis: Analysis | null;
  onSave: (result: {
    id: number;
    result: number;
    analysis_result: string;
  }) => Promise<void>;
  onClose: () => void;
  onStatusUpdate: (newStatus: "n" | "ip" | "f") => Promise<void>;
}) {
  const [results, setResults] = useState<
    { id: number; result: number; analysis_result: string; loading?: boolean }[]
  >([]);
  const [status, setStatus] = useState<"n" | "ip" | "f">("n");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (analysis) {
      setStatus(analysis.status);
      const initialResults =
        analysis.department_types?.result?.map((res) => ({
          id: res.analysis_result?.[0]?.id || 0,
          result: res.id,
          analysis_result: res.analysis_result?.[0]?.analysis_result || "",
          loading: false,
        })) || [];
      setResults(initialResults);
    }
  }, [analysis]);

  const handleResultChange = (resultId: number, value: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.result === resultId ? { ...r, analysis_result: value } : r
      )
    );
  };

  const handleSaveSingleResult = async (resultId: number) => {
    const resultToSave = results.find((r) => r.result === resultId);
    if (!resultToSave) return;

    setResults((prev) =>
      prev.map((r) => (r.result === resultId ? { ...r, loading: true } : r))
    );
    try {
      await onSave(resultToSave);
      toast.success("Natija muvaffaqiyatli saqlandi");
    } catch (error) {
      toast.error("Natijani saqlashda xatolik");
    } finally {
      setResults((prev) =>
        prev.map((r) => (r.result === resultId ? { ...r, loading: false } : r))
      );
    }
  };

  const handleStatusUpdate = async () => {
    setStatusLoading(true);
    try {
      await onStatusUpdate(status);
      toast.success("Status muvaffaqiyatli yangilandi");
    } catch (error) {
      toast.error("Statusni yangilashda xatolik");
    } finally {
      setStatusLoading(false);
    }
  };

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-status" className="text-sm font-semibold">
            Tahlil Holati
          </Label>
          <Select
            value={status}
            onValueChange={(value: "n" | "ip" | "f") => setStatus(value)}
          >
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n">Yangi</SelectItem>
              <SelectItem value="ip">Jarayonda</SelectItem>
              <SelectItem value="f">Yakunlangan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleStatusUpdate}
          disabled={statusLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {statusLoading ? "Yangilanmoqda..." : "Yangilash"}
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Natijalarni Tahrirlash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-700 w-[40%]">
                    Natija
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Qiymat
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">
                    Amal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.department_types?.result?.map((result) => {
                  const currentResult = results.find(
                    (r) => r.result === result.id
                  );
                  return (
                    <TableRow
                      key={result.id}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {result.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Norma:{" "}
                          <span className="font-semibold">{result.norma}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={currentResult?.analysis_result || ""}
                          onChange={(e) =>
                            handleResultChange(result.id, e.target.value)
                          }
                          placeholder="Qiymat kiriting..."
                          className="border-gray-200 focus:border-primary"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSaveSingleResult(result.id)}
                          disabled={currentResult?.loading}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          {currentResult?.loading
                            ? "Saqlanmoqda..."
                            : "Saqlash"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TestResults() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAnalysis, setViewingAnalysis] = useState<Analysis | null>(null);

  const [analysisResults, setAnalysisResults] = useState<
    AnalysisResultPayload[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, departmentTypesRes, analysesRes] =
          await Promise.all([
            patientService.findAll(),
            departmentTypeService.findAll(),
            labService.findAllAnalysis(),
          ]);
        setPatients(patientsRes);
        setDepartmentTypes(departmentTypesRes);
        setAnalyses(analysesRes);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateAnalysis = (analysisId: number, updates: Partial<Analysis>) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === analysisId ? { ...a, ...updates } : a))
    );
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        analysis: p.analysis?.map((a) =>
          a.id === analysisId ? { ...a, ...updates } : a
        ),
      }))
    );
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
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
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
      toast.success(`${selectedFiles.length} ta fayl tanlandi`);
    }
  };

  const handleEditClick = (analysis: Analysis) => {
    setEditingAnalysis(analysis);
  };

  const handleSaveSingleResult = async (result: {
    id: number;
    result: number;
    analysis_result: string;
  }) => {
    if (!editingAnalysis) return;
    await analysisResultService.update(result);
  };

  const handleStatusUpdate = async (newStatus: "n" | "ip" | "f") => {
    if (!editingAnalysis) return;
    await labService.updateAnalysis({
      id: editingAnalysis.id,
      dto: { status: newStatus },
    });
    updateAnalysis(editingAnalysis.id, { status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      n: {
        label: "Yangi",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      },
      ip: {
        label: "Jarayonda",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      f: {
        label: "Yakunlangan",
        className: "bg-green-50 text-green-700 border border-green-200",
      },
      r: {
        label: "Ro'yxatdan o'tgan",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      l: {
        label: "Laboratoriyada",
        className: "bg-purple-50 text-purple-700 border border-purple-200",
      },
      d: {
        label: "Doktorda",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      },
      t: {
        label: "To'lovda",
        className: "bg-pink-50 text-pink-700 border border-pink-200",
      },
      rc: {
        label: "Ro'yxatdan o'chirilgan",
        className: "bg-red-50 text-red-700 border border-red-200",
      },
    };
    return (
      statusConfig[status] || {
        label: status,
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      }
    );
  };

  const registeredPatients = patients.filter(
    (p) => p.patient_status === "r" || p.patient_status === "l"
  );

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
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Barcha bemorlar
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
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
                            {patient.name} {patient.last_name} —{" "}
                            {patient.disease_uz}
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
                            {type.title_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {analysisResults.length > 0 && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
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
                >
                  <TestTube className="w-5 h-5 mr-2" />
                  Tahlilni saqlash
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
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
                        ID: <span className="font-medium">{patient.id}</span> •
                        Ro'yxatga olindi:{" "}
                        <span className="font-medium">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        getStatusBadge(patient.patient_status).className
                      }`}
                    >
                      {getStatusBadge(patient.patient_status).label}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-6 py-8">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          Bemor ma'lumotlari
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              Jinsi:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {patient.gender === "e" ? "Erkak" : "Ayol"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              Tug'ilgan sana:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {patient.birth_date}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              Telefon:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {patient.phone_number}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              To'lov holati:
                            </span>
                            <Badge
                              className={
                                patient.payment_status === "c"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }
                            >
                              {patient.payment_status === "c"
                                ? "To'langan"
                                : "To'lanmagan"}
                            </Badge>
                          </div>
                          <div className="col-span-full flex justify-between items-start pb-3 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              Manzil:
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-right">
                              {patient.address}
                            </span>
                          </div>
                          <div className="col-span-full flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">
                              Kasallik:
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-right">
                              {patient.disease_uz}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {patient.consultations &&
                      patient.consultations.length > 0 && (
                        <Card className="border-gray-200">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">
                              Konsultatsiyalar
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {patient.consultations.map((consultation) => (
                              <div
                                key={consultation.id}
                                className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 bg-gradient-to-r from-blue-50/50 to-transparent p-4 rounded-lg"
                              >
                                <p className="text-sm mb-2">
                                  <span className="font-semibold text-gray-700">
                                    Tashxis:
                                  </span>{" "}
                                  <span className="text-gray-900">
                                    {consultation.diagnosis_uz}
                                  </span>
                                </p>
                                <p className="text-sm mb-2">
                                  <span className="font-semibold text-gray-700">
                                    Tavsiya:
                                  </span>{" "}
                                  <span className="text-gray-900">
                                    {consultation.recommendation_uz}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-semibold text-gray-700">
                                    Retsept:
                                  </span>{" "}
                                  <span className="text-gray-900">
                                    {consultation.recipe_uz}
                                  </span>
                                </p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                    {patient.analysis && patient.analysis.length > 0 && (
                      <Card className="border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Tahlillar
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {patient.analysis.map((analysisItem) => (
                            <div
                              key={analysisItem.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="font-semibold text-gray-900 text-base">
                                    {analysisItem.department_types?.title_uz}
                                  </p>
                                  <Badge
                                    className={`${
                                      getStatusBadge(analysisItem.status)
                                        .className
                                    } mt-2`}
                                  >
                                    {getStatusBadge(analysisItem.status).label}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Dialog
                                    open={
                                      viewingAnalysis?.id === analysisItem.id
                                    }
                                    onOpenChange={(isOpen: boolean) =>
                                      !isOpen && setViewingAnalysis(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          setViewingAnalysis(analysisItem)
                                        }
                                        className="h-10 w-10 hover:bg-blue-50"
                                      >
                                        <Eye className="w-4 h-4 text-gray-600" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle className="text-xl">
                                          Tahlil Natijalarini Ko'rish
                                        </DialogTitle>
                                        <DialogDescription>
                                          {patient.name} {patient.last_name} —{" "}
                                          {
                                            viewingAnalysis?.department_types
                                              ?.title_uz
                                          }
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="font-semibold">
                                                Natija
                                              </TableHead>
                                              <TableHead className="font-semibold">
                                                Qiymat
                                              </TableHead>
                                              <TableHead className="font-semibold">
                                                Norma
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {viewingAnalysis?.department_types?.result?.map(
                                              (res) => (
                                                <TableRow key={res.id}>
                                                  <TableCell className="font-medium text-gray-900">
                                                    {res.title}
                                                  </TableCell>
                                                  <TableCell className="text-gray-900">
                                                    {res.analysis_result?.[0]
                                                      ?.analysis_result ||
                                                      "Kiritilmagan"}
                                                  </TableCell>
                                                  <TableCell className="text-gray-900">
                                                    {res.norma}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Dialog
                                    open={
                                      editingAnalysis?.id === analysisItem.id
                                    }
                                    onOpenChange={(isOpen: boolean) =>
                                      !isOpen && setEditingAnalysis(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleEditClick(analysisItem)
                                        }
                                        className="h-10 w-10 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl">
                                          Tahlilni Tahrirlash
                                        </DialogTitle>
                                        <DialogDescription>
                                          {patient.name} {patient.last_name} —{" "}
                                          {
                                            editingAnalysis?.department_types
                                              ?.title_uz
                                          }
                                        </DialogDescription>
                                      </DialogHeader>
                                      <EditAnalysisDialog
                                        analysis={editingAnalysis}
                                        onSave={handleSaveSingleResult}
                                        onStatusUpdate={handleStatusUpdate}
                                        onClose={() => setEditingAnalysis(null)}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                              {analysisItem.files &&
                                analysisItem.files.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="font-medium text-sm text-gray-700 mb-3">
                                      Fayllar:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisItem.files.map((file) => (
                                        <a
                                          key={file.id}
                                          href={file.file}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline text-sm flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors border border-blue-200"
                                        >
                                          <FileText className="w-4 h-4" />
                                          Fayl #{file.id}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
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