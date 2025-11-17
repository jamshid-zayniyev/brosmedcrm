import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  TestTube,
  Upload,
  BarChart3,
  TrendingUp,
  Edit,
  User,
  FileText,
  Download,
  Sparkles,
  Clock,
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

export function TestResults() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addPatientHistory = (patientId: string, historyEntry: any) => {
    console.log(`History added for patient ${patientId}:`, historyEntry);
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    departmentTypeId: "",
    analysisResult: "",
    analysisResultUz: "",
    analysisResultRu: "",
    status: "n" as "n" | "ip" | "f",
  });
  const [editFormData, setEditFormData] = useState({
    departmentTypeId: "",
    analysisResult: "",
    analysisResultUz: "",
    analysisResultRu: "",
    status: "n" as "n" | "ip" | "f",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Bemorni tanlang");
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
      const formDataToSend = new FormData();
      formDataToSend.append("patient", patient.id.toString());
      formDataToSend.append("department_types", departmentType.id.toString());
      formDataToSend.append("analysis_result", formData.analysisResult);
      formDataToSend.append("analysis_result_uz", formData.analysisResultUz);
      formDataToSend.append("analysis_result_ru", formData.analysisResultRu);
      formDataToSend.append("status", formData.status);

      if (files.length > 0) {
        files.forEach((file) => {
          formDataToSend.append("files", file);
        });
      }

      const newAnalysis = await labService.createAnalysis(formDataToSend);
      addAnalysis(newAnalysis);

      addPatientHistory(selectedPatient, {
        id: `h${Date.now()}`,
        date: new Date().toISOString(),
        type: "lab-test",
        description: `Laboratoriya tahlili: ${departmentType.title_uz}`,
        labTest: departmentType.title_uz,
        labResult: formData.analysisResultUz,
      });

      toast.success("Tahlil natijasi saqlandi");

      setFormData({
        departmentTypeId: "",
        analysisResult: "",
        analysisResultUz: "",
        analysisResultRu: "",
        status: "n",
      });
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

    if (!editingAnalysis) return;

    const departmentType = departmentTypes.find(
      (dt) => dt.id.toString() === editFormData.departmentTypeId
    );

    if (!departmentType) {
      toast.error("Tahlil turi topilmadi");
      return;
    }

    try {
      const updateData = {
        department_types: departmentType.id,
        analysis_result: editFormData.analysisResult,
        analysis_result_uz: editFormData.analysisResultUz,
        analysis_result_ru: editFormData.analysisResultRu,
        status: editFormData.status,
      };

      await labService.updateAnalysis({
        id: editingAnalysis.id,
        dto: updateData,
      });

      updateAnalysis(editingAnalysis.id, {
        department_types: departmentType,
        analysis_result: editFormData.analysisResult,
        analysis_result_uz: editFormData.analysisResultUz,
        analysis_result_ru: editFormData.analysisResultRu,
        status: editFormData.status,
      });
    } catch (error) {
      console.error("Tahlil yangilashda xatolik:", error);
      toast.error("Tahlil yangilashda xatolik yuz berdi");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      n: {
        label: "Yangi",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      ip: {
        label: "Jarayonda",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      f: {
        label: "Yakunlangan",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
    };
    return statusConfig[status] || statusConfig["n"];
  };

  const analyzeTestResult = (analysis: Analysis) => {
    const resultAnalysis = {
      concerns: [] as string[],
      recommendations: [] as string[],
    };

    const resultText = analysis.analysis_result_uz.toLowerCase();

    if (resultText.includes("yuqori") || resultText.includes("oshgan")) {
      resultAnalysis.concerns.push("Ko'rsatkichlar me'yordan yuqori");
      resultAnalysis.recommendations.push(
        "Shifokor konsultatsiyasi tavsiya etiladi"
      );
    }

    if (resultText.includes("past") || resultText.includes("kamaygan")) {
      resultAnalysis.concerns.push("Ko'rsatkichlar me'yordan past");
      resultAnalysis.recommendations.push(
        "Qo'shimcha tekshiruvlar kerak bo'lishi mumkin"
      );
    }

    if (resultText.includes("normal")) {
      resultAnalysis.recommendations.push("Natijalar me'yor doirasida");
    }

    return resultAnalysis;
  };

  const registeredPatients = patients.filter(
    (p) => p.patient_status === "r" || p.patient_status === "l"
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Tahlillar va tekshiruvlar</h1>
          <p className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Yuklanmoqda...</p>
          </CardContent>
        </Card>
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
                  {selectedPatient &&
                    (() => {
                      const patient = registeredPatients.find(
                        (p) => p.id.toString() === selectedPatient
                      );
                      return patient ? (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Bemor:
                            </span>{" "}
                            <span className="font-medium">
                              {patient.name} {patient.last_name}
                            </span>
                          </p>
                        </div>
                      ) : null;
                    })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentType">Tahlil turi *</Label>
                  <Select
                    value={formData.departmentTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, departmentTypeId: value })
                    }
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

                <div className="space-y-2">
                  <Label htmlFor="analysisResult">Tahlil natijasi (EN) *</Label>
                  <Textarea
                    id="analysisResult"
                    value={formData.analysisResult}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysisResult: e.target.value,
                      })
                    }
                    placeholder="Tahlil natijasini kiriting..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analysisResultUz">
                    Tahlil natijasi (UZ) *
                  </Label>
                  <Textarea
                    id="analysisResultUz"
                    value={formData.analysisResultUz}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysisResultUz: e.target.value,
                      })
                    }
                    placeholder="Tahlil natijasini uzbek tilida kiriting..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analysisResultRu">
                    Tahlil natijasi (RU) *
                  </Label>
                  <Textarea
                    id="analysisResultRu"
                    value={formData.analysisResultRu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysisResultRu: e.target.value,
                      })
                    }
                    placeholder="Tahlil natijasini rus tilida kiriting..."
                    rows={3}
                    required
                  />
                </div>

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
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, PDF (maks. 10MB)
                    </p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Tanlangan fayllar:</p>
                      <ul className="space-y-1">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-center justify-between bg-muted p-2 rounded-md"
                          >
                            <span>
                              {file.name} ({Math.round(file.size / 1024)} KB)
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFiles([])}
                        className="mt-2 w-full"
                      >
                        Fayllarni tozalash
                      </Button>
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

                return (
                  <Card
                    key={analysis.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TestTube className="w-6 h-6 text-primary" />
                          </div>

                          <div className="space-y-2 flex-1">
                            <div>
                              <h3>
                                {patient
                                  ? `${patient.name} ${patient.last_name}`
                                  : "Noma'lum bemor"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {analysis.department_types?.title_uz ||
                                  "Noma'lum tahlil turi"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className={
                                  getStatusBadge(analysis.status).className
                                }
                              >
                                {getStatusBadge(analysis.status).label}
                              </Badge>
                              <Badge variant="outline">Laborant</Badge>
                              <Badge variant="outline">
                                {new Date(
                                  analysis.patient.created_at
                                ).toLocaleDateString("uz-UZ")}
                              </Badge>
                              {analysis.files.length > 0 && (
                                <Badge variant="outline">
                                  {analysis.files.length} ta fayl
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm mt-2 line-clamp-2">
                              {analysis.analysis_result_uz}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Dialog
                            open={editingAnalysis?.id === analysis.id}
                            onOpenChange={(open: boolean) =>
                              !open && setEditingAnalysis(null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(analysis)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Tahrirlash
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Tahlil natijasini tahrirlash
                                </DialogTitle>
                                <DialogDescription>
                                  Tahlil natijalarini o'zgartirish
                                </DialogDescription>
                              </DialogHeader>
                              {editingAnalysis && (
                                <form
                                  onSubmit={handleEditSubmit}
                                  className="space-y-6"
                                >
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-departmentType">
                                      Tahlil turi *
                                    </Label>
                                    <Select
                                      value={editFormData.departmentTypeId}
                                      onValueChange={(value) =>
                                        setEditFormData({
                                          ...editFormData,
                                          departmentTypeId: value,
                                        })
                                      }
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departmentTypes.map((type) => (
                                          <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                          >
                                            {type.title_uz}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-analysisResult">
                                      Tahlil natijasi (EN) *
                                    </Label>
                                    <Textarea
                                      id="edit-analysisResult"
                                      value={editFormData.analysisResult}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          analysisResult: e.target.value,
                                        })
                                      }
                                      placeholder="Tahlil natijasini kiriting..."
                                      rows={3}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-analysisResultUz">
                                      Tahlil natijasi (UZ) *
                                    </Label>
                                    <Textarea
                                      id="edit-analysisResultUz"
                                      value={editFormData.analysisResultUz}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          analysisResultUz: e.target.value,
                                        })
                                      }
                                      placeholder="Tahlil natijasini uzbek tilida kiriting..."
                                      rows={3}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-analysisResultRu">
                                      Tahlil natijasi (RU) *
                                    </Label>
                                    <Textarea
                                      id="edit-analysisResultRu"
                                      value={editFormData.analysisResultRu}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          analysisResultRu: e.target.value,
                                        })
                                      }
                                      placeholder="Tahlil natijasini rus tilida kiriting..."
                                      rows={3}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-status">
                                      Status *
                                    </Label>
                                    <Select
                                      value={editFormData.status}
                                      onValueChange={(
                                        value: "n" | "ip" | "f"
                                      ) =>
                                        setEditFormData({
                                          ...editFormData,
                                          status: value,
                                        })
                                      }
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="n">Yangi</SelectItem>
                                        <SelectItem value="ip">
                                          Jarayonda
                                        </SelectItem>
                                        <SelectItem value="f">
                                          Yakunlangan
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditingAnalysis(null)}
                                    >
                                      Bekor qilish
                                    </Button>
                                    <Button type="submit">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Saqlash
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAnalysis(analysis)}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Tahlil qilish
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <BarChart3 className="w-6 h-6" />
                                  Tahlil Natijasi
                                </DialogTitle>
                                <DialogDescription>
                                  Bemor tahlilining to'liq ma'lumotlari va
                                  natijalari.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedAnalysis && (
                                <div className="space-y-6 pt-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Bemor ma'lumotlari
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">
                                          F.I.O.
                                        </p>
                                        <p className="font-medium">
                                          {patient
                                            ? `${patient.name} ${patient.last_name}`
                                            : "Noma'lum"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">
                                          Tahlil turi
                                        </p>
                                        <p className="font-medium">
                                          {selectedAnalysis.department_types
                                            ?.title_uz ||
                                            "Noma'lum tahlil turi"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">
                                          Sana
                                        </p>
                                        <p className="font-medium">
                                          {new Date(
                                            selectedAnalysis.patient.created_at
                                          ).toLocaleString("uz-UZ")}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">
                                          Laborant
                                        </p>
                                        <p className="font-medium">Laborant</p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Tahlil natijasi
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                                        {selectedAnalysis.analysis_result_uz}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {selectedAnalysis.files.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Download className="w-5 h-5 text-primary" />
                                          Biriktirilgan fayllar
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        {selectedAnalysis.files.map(
                                          (file, idx) => (
                                            <a
                                              key={idx}
                                              href={file.file}
                                              download
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center justify-between gap-2 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                            >
                                              <span className="font-medium text-sm truncate">
                                                {file.file.split("/").pop()}
                                              </span>
                                              <Download className="w-4 h-4 text-muted-foreground" />
                                            </a>
                                          )
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}

                                  {(analyzeTestResult(selectedAnalysis).concerns
                                    .length > 0 ||
                                    analyzeTestResult(selectedAnalysis)
                                      .recommendations.length > 0) && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Sparkles className="w-5 h-5 text-primary" />
                                          Avtomatik tahlil
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        {analyzeTestResult(selectedAnalysis)
                                          .concerns.length > 0 && (
                                          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-sm font-semibold mb-2 text-red-900 dark:text-red-100">
                                              E'tiborga olish kerak:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {analyzeTestResult(
                                                selectedAnalysis
                                              ).concerns.map((concern, idx) => (
                                                <li
                                                  key={idx}
                                                  className="text-sm text-red-800 dark:text-red-200"
                                                >
                                                  {concern}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {analyzeTestResult(selectedAnalysis)
                                          .recommendations.length > 0 && (
                                          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
                                              Tavsiyalar:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {analyzeTestResult(
                                                selectedAnalysis
                                              ).recommendations.map(
                                                (rec, idx) => (
                                                  <li
                                                    key={idx}
                                                    className="text-sm text-blue-800 dark:text-blue-200"
                                                  >
                                                    {rec}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <ClipboardCheck className="w-5 h-5 text-primary" />
                                        Statusni o'zgartirish
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Select
                                        value={selectedAnalysis.status}
                                        onValueChange={(
                                          value: "n" | "ip" | "f"
                                        ) => {
                                          handleUpdateStatus(
                                            selectedAnalysis.id,
                                            value
                                          );
                                          setSelectedAnalysis({
                                            ...selectedAnalysis,
                                            status: value,
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="n">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-4 h-4 text-red-500" />
                                              Yangi
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="ip">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-4 h-4 text-yellow-500" />
                                              Jarayonda
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="f">
                                            <div className="flex items-center gap-2">
                                              <ClipboardCheck className="w-4 h-4 text-green-500" />
                                              Yakunlangan
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Select
                            value={analysis.status}
                            onValueChange={(value: "n" | "ip" | "f") =>
                              handleUpdateStatus(analysis.id, value)
                            }
                          >
                            <SelectTrigger className="text-xs">
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
