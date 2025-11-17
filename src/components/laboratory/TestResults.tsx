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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This function also needs to be refactored to handle the new result structure
    // For now, it's left as is, as the request was about creating new analyses.
    if (!editingAnalysis) return;
    toast.info("Tahrirlash logikasi yangilanishi kerak.");
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
    return <div>Yuklanmoqda...</div>;
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
          {/* This part remains unchanged for now */}
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
                return (
                  <Card
                    key={analysis.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between gap-4">
                        <div className="space-y-2">
                          <h3>
                            {patient
                              ? `${patient.name} ${patient.last_name}`
                              : "Noma'lum bemor"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {analysis.department_types?.title_uz ||
                              "Noma'lum tahlil turi"}
                          </p>
                          <Badge
                            className={
                              getStatusBadge(analysis.status).className
                            }
                          >
                            {getStatusBadge(analysis.status).label}
                          </Badge>
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
                                Tahlil
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              {/* Dialog content for viewing analysis */}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(analysis)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Tahrir
                          </Button>
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
