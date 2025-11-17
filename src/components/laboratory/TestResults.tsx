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
  Download,
  Sparkles,
  ClipboardCheck,
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
import { Patient } from "../../interfaces/patient.interface";
import { Analysis } from "../../interfaces/analysis.interface";
import { DepartmentType } from "../../interfaces/department-type.interface";
import { labService } from "../../services/lab.service";
import { departmentTypeService } from "../../services/department-type.service";
import { patientService } from "../../services/patient.service";
import { analysisResultService } from "../../services/analysis-result.service";
import { AnalysisResultPayload } from "../../interfaces/analysis-result.interface";

function EditAnalysisDialog({
  analysis,
  onSave,
  onClose
}: {
  analysis: Analysis | null;
  onSave: (updatedResults: { id: number; result: number; analysis_result: string }[], newStatus?: "n" | "ip" | "f") => void;
  onClose: () => void;
}) {
  const [results, setResults] = useState<{ id: number; result: number; analysis_result: string }[]>([]);
  const [status, setStatus] = useState<"n" | "ip" | "f">("n");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (analysis) {
      setStatus(analysis.status);
      const initialResults = analysis.department_types?.result?.map(res => ({
        id: res.analysis_result?.[0]?.id || 0,
        result: res.id,
        analysis_result: res.analysis_result?.[0]?.analysis_result || ""
      })) || [];
      setResults(initialResults);
    }
  }, [analysis]);

  const handleResultChange = (resultId: number, value: string) => {
    setResults(prev =>
      prev.map(r => r.result === resultId ? { ...r, analysis_result: value } : r)
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(results, status);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: "n" | "ip" | "f") => setStatus(value)}
          >
            <SelectTrigger>
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

      <div className="border rounded-lg">
        <div className="bg-muted p-3 border-b">
          <h4 className="font-medium">Natijalarni tahrirlash</h4>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {analysis.department_types?.result?.map((result) => (
            <div key={result.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Norma: {result.norma}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Input
                    value={results.find(r => r.result === result.id)?.analysis_result || ""}
                    onChange={(e) => handleResultChange(result.id, e.target.value)}
                    placeholder="Qiymatni kiriting"
                  />
                </div>
              </div>
            </div>
          )) || (
            <div className="p-4 text-center text-muted-foreground">
              Natijalar mavjud emas
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
}

export function TestResults() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  // New state for dynamic results
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

  const addAnalysis = (newAnalysis: Analysis) => {
    setAnalyses((prev) => [...prev, newAnalysis]);
  };

  const updateAnalysis = (analysisId: number, updates: Partial<Analysis>) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === analysisId ? { ...a, ...updates } : a))
    );
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    departmentTypeId: "",
    status: "n" as "n" | "ip" | "f",
  });
  const [editFormData, setEditFormData] = useState({
    departmentTypeId: "",
    analysisResult: "",
    analysisResultUz: "",
    analysisResultRu: "",
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
      // --- Request 1: Create main analysis entry ---
      const analysisFormData = new FormData();
      analysisFormData.append("patient", patient.id.toString());
      analysisFormData.append("department_types", departmentType.id.toString());
      analysisFormData.append("status", formData.status);
      if (files.length > 0) {
        files.forEach((file) => {
          analysisFormData.append("files", file);
        });
      }
      const createAnalysisPromise = labService.createAnalysis(analysisFormData);

      // --- Request 2: Create analysis results ---
      const createResultsPromise =
        analysisResultService.create(analysisResults);

      // --- Run in parallel ---
      const [newAnalysis] = await Promise.all([
        createAnalysisPromise,
        createResultsPromise,
      ]);

      addAnalysis(newAnalysis);

      toast.success("Tahlil va uning natijalari muvaffaqiyatli saqlandi");

      // Reset form
      setFormData({ departmentTypeId: "", status: "n" });
      setAnalysisResults([]);
      setFiles([]);
      setSelectedPatient("");
    } catch (error) {
      console.error("Tahlil yaratishda xatolik:", error);
      toast.error("Tahlil yaratishda xatolik yuz berdi");
    }
  };

  const handleUpdateStatus = async (
    analysisId: number,
    status: "n" | "ip" | "f"
  ) => {
    try {
      await labService.updateAnalysis({ id: analysisId, dto: { status } });
      updateAnalysis(analysisId, { status });
      toast.success("Status yangilandi");
    } catch (error) {
      console.error("Status yangilashda xatolik:", error);
      toast.error("Status yangilashda xatolik yuz berdi");
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
    setEditFormData({
      departmentTypeId: analysis.department_types?.id.toString() || "",
      analysisResult: analysis.analysis_result,
      analysisResultUz: analysis.analysis_result_uz,
      analysisResultRu: analysis.analysis_result_ru,
      status: analysis.status,
    });
  };

  const handleEditSubmit = async (updatedResults: { id: number; result: number; analysis_result: string }[], newStatus?: "n" | "ip" | "f") => {
    if (!editingAnalysis) return;

    try {
      // Update results
      if (updatedResults.length > 0) {
        await Promise.all(
          updatedResults.map(result =>
            analysisResultService.update(result)
          )
        );
      }

      // Update status if changed
      if (newStatus && newStatus !== editingAnalysis.status) {
        await labService.updateAnalysis({ id: editingAnalysis.id, dto: { status: newStatus } });
        updateAnalysis(editingAnalysis.id, { status: newStatus });
      }

      // Refresh analyses list
      const [analysesRes] = await Promise.all([
        labService.findAllAnalysis(),
      ]);
      setAnalyses(analysesRes);

      toast.success("Tahlil muvaffaqiyatli yangilandi");
      setEditingAnalysis(null);
    } catch (error) {
      console.error("Tahlil yangilashda xatolik:", error);
      toast.error("Tahlil yangilashda xatolik yuz berdi");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      n: { label: "Yangi", className: "bg-red-100 text-red-800" },
      ip: { label: "Jarayonda", className: "bg-yellow-100 text-yellow-800" },
      f: { label: "Yakunlangan", className: "bg-green-100 text-green-800" },
    };
    return statusConfig[status] || statusConfig["n"];
  };

  const registeredPatients = patients.filter(
    (p) => p.patient_status === "r" || p.patient_status === "l"
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
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
    <div className="space-y-6">
      <div>
        <h1>Tahlillar va tekshiruvlar</h1>
        <p className="text-muted-foreground">
          Bemorlar uchun tahlil natijalarini kiriting va tahlil qiling
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Barcha tahlillar</TabsTrigger>
          <TabsTrigger value="new">Yangi tahlil</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <TestTube className="w-5 h-5 inline mr-2" />
                Yangi tahlil kiritish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patient">Bemorni tanlang *</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bemorni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredPatients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          {patient.name} {patient.last_name} -{" "}
                          {patient.disease_uz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentType">Tahlil turi *</Label>
                  <Select
                    value={formData.departmentTypeId}
                    onValueChange={handleDepartmentTypeChange}
                    required
                  >
                    <SelectTrigger>
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

                {analysisResults.length > 0 && (
                  <Card className="p-4">
                    <CardHeader className="p-2">
                      <CardTitle className="text-base">
                        Natijalarni kiritish
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                      {departmentTypes
                        .find(
                          (dt) => dt.id.toString() === formData.departmentTypeId
                        )
                        ?.result.map((resItem) => (
                          <div
                            key={resItem.id}
                            className="grid grid-cols-3 items-center gap-4"
                          >
                            <Label
                              htmlFor={`result-${resItem.id}`}
                              className="text-right"
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
                              placeholder="Natija"
                            />
                            <span className="text-sm text-muted-foreground">
                              Norma: {resItem.norma}
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "n" | "ip" | "f") =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n">Yangi</SelectItem>
                      <SelectItem value="ip">Jarayonda</SelectItem>
                      <SelectItem value="f">Yakunlangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Fayllar (ixtiyoriy)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="files" className="cursor-pointer">
                      <span className="text-primary">Fayl tanlash</span> yoki bu
                      yerga tashlang
                    </Label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Tanlangan fayllar:</p>
                      <ul className="space-y-1">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <TestTube className="w-4 h-4 mr-2" />
                  Tahlilni saqlash
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4">
            {analyses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Hozircha tahlillar yo'q
                  </p>
                </CardContent>
              </Card>
            ) : (
              [...analyses].reverse().map((analysis) => {
                const patient = analysis.patient;
                const resultCount = analysis.department_types?.result?.length || 0;
                const completedResults = analysis.department_types?.result?.filter(r =>
                  r.analysis_result && r.analysis_result.some(ar => ar.analysis_result.trim() !== "")
                ).length || 0;

                return (
                  <Card
                    key={analysis.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {patient
                                ? `${patient.name} ${patient.last_name}`
                                : "Noma'lum bemor"}
                            </h3>
                            <Badge
                              className={
                                getStatusBadge(analysis.status).className
                              }
                            >
                              {getStatusBadge(analysis.status).label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.department_types?.title_uz ||
                              "Noma'lum tahlil turi"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>ID: {analysis.id}</span>
                            <span>Natijalar: {completedResults}/{resultCount}</span>
                            {analysis.files && analysis.files.length > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {analysis.files.length} ta fayl
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAnalysis(analysis)}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Ko'rish
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <BarChart3 className="w-5 h-5" />
                                  Tahlil natijalari
                                </DialogTitle>
                                <DialogDescription>
                                  {patient ? `${patient.name} ${patient.last_name}` : "Noma'lum bemor"} - {analysis.department_types?.title_uz}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Bemor:</span> {patient ? `${patient.name} ${patient.last_name}` : "Noma'lum"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Tahlil turi:</span> {analysis.department_types?.title_uz}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>{" "}
                                    <Badge className={getStatusBadge(analysis.status).className}>
                                      {getStatusBadge(analysis.status).label}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="font-medium">ID:</span> {analysis.id}
                                  </div>
                                </div>

                                <div className="border rounded-lg">
                                  <div className="bg-muted p-3 border-b">
                                    <h4 className="font-medium">Natijalar</h4>
                                  </div>
                                  <div className="divide-y">
                                    {analysis.department_types?.result?.map((result) => (
                                      <div key={result.id} className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="md:col-span-1">
                                            <div className="font-medium text-sm">{result.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Norma: {result.norma}
                                            </div>
                                          </div>
                                          <div className="md:col-span-2">
                                            <div className="text-sm">
                                              <span className="font-medium">Qiymat:</span>{" "}
                                              {result.analysis_result?.[0]?.analysis_result || "Kiritilmagan"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )) || (
                                      <div className="p-4 text-center text-muted-foreground">
                                        Natijalar mavjud emas
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {analysis.files && analysis.files.length > 0 && (
                                  <div className="border rounded-lg">
                                    <div className="bg-muted p-3 border-b">
                                      <h4 className="font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Fayllar ({analysis.files.length})
                                      </h4>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      {analysis.files.map((file) => (
                                        <div key={file.id} className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-muted-foreground" />
                                          <a
                                            href={file.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            Fayl #{file.id}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(analysis)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Tahrir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Edit className="w-5 h-5" />
                                  Tahlilni tahrirlash
                                </DialogTitle>
                                <DialogDescription>
                                  {patient ? `${patient.name} ${patient.last_name}` : "Noma'lum bemor"} - {analysis.department_types?.title_uz}
                                </DialogDescription>
                              </DialogHeader>
                              <EditAnalysisDialog
                                analysis={editingAnalysis}
                                onSave={handleEditSubmit}
                                onClose={() => setEditingAnalysis(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
