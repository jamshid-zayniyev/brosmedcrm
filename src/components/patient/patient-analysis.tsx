import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  BarChart3,
  Edit,
  FileText,
  Eye,
  FileSearch,
  List,
  TrendingUp,
  Target,
  FileDown,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Patient } from "../../interfaces/patient.interface";
import { labService } from "../../services/lab.service";
import { patientService } from "../../services/patient.service";
import { analysisResultService } from "../../services/analysis-result.service";
import { Analysis } from "../../interfaces/analysis.interface";
import { diseaseService } from "../../services/disease.service";
import { formattedDate } from "../../utils/formatted-date";
import logo from "../../assets/logo.png";
import pechat from '../../assets/pechat.png'

function EditAnalysisDialog({
  analysis,
  onSave,
  onStatusUpdate,
}: {
  analysis: Partial<Analysis> | null;
  onSave: (result: {
    id: number;
    result: number;
    analysis_result: string;
  }) => Promise<void>;
  onClose: () => void;
  onStatusUpdate: (newStatus: "n" | "ip" | "f") => Promise<void>;
}) {
  const [results, setResults] = useState<
    { id: number; result: number; analysis_result: string }[]
  >([]);
  const [initialResults, setInitialResults] = useState<
    { id: number; result: number; analysis_result: string }[]
  >([]);
  const [status, setStatus] = useState<"n" | "ip" | "f">("n");
  const [statusLoading, setStatusLoading] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    if (analysis) {
      setStatus(analysis.status || "n");
      const initialData =
        analysis.department_types?.result?.map((res) => ({
          id: res.analysis_result?.[0]?.id || 0,
          result: res.id,
          analysis_result: res.analysis_result?.[0]?.analysis_result || "",
        })) || [];
      setResults(initialData);
      setInitialResults(initialData);
    }
  }, [analysis]);

  const handleResultChange = (resultId: number, value: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.result === resultId ? { ...r, analysis_result: value } : r
      )
    );
  };

  const handleSaveAll = async () => {
    const changedResults = results.filter((current) => {
      const initial = initialResults.find((ir) => ir.result === current.result);
      return initial && initial.analysis_result !== current.analysis_result;
    });

    if (changedResults.length === 0) {
      toast.info("O'zgarishlar mavjud emas.");
      return;
    }

    setIsSavingAll(true);
    const toastId = toast.loading(
      `Yangilanmoqda... 0/${changedResults.length}`
    );

    try {
      for (let i = 0; i < changedResults.length; i++) {
        const resultToSave = changedResults[i];
        await onSave(resultToSave);
        toast.loading(`Yangilanmoqda... ${i + 1}/${changedResults.length}`, {
          id: toastId,
        });
      }

      toast.success("Barcha natijalar muvaffaqiyatli yangilandi!", {
        id: toastId,
      });
      setInitialResults(results);
    } catch (error) {
      console.error("Failed to save all results:", error);
      toast.error("Yangilashda xatolik yuz berdi. Jarayon to'xtatildi.", {
        id: toastId,
      });
    } finally {
      setIsSavingAll(false);
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
            disabled={isSavingAll}
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
          disabled={statusLoading || isSavingAll}
          className="bg-primary hover:bg-primary/90"
        >
          {statusLoading ? "Yangilanmoqda..." : "Statusni Yangilash"}
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
                  <TableHead className="font-semibold text-gray-700 w-[50%]">
                    Natija
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Qiymat
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
                          disabled={isSavingAll}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSaveAll}
        disabled={isSavingAll || statusLoading}
        className="w-full"
      >
        {isSavingAll ? "Saqlanmoqda..." : "Barchasini Saqlash"}
      </Button>
    </div>
  );
}

interface Disease {
  id: number;
  disease: string;
  patient: number;
  department: {
    title?: string;
  };
  department_types?: {
    title?: string;
  };
  user?: {
    full_name: string;
  };
}

export default function PatientAnalysis() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // State for the on-demand analysis view
  const [viewingAnalysisId, setViewingAnalysisId] = useState<number | null>(
    null
  );
  const [detailedAnalysisData, setDetailedAnalysisData] = useState<any | null>(
    null
  );
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  // State for the on-demand analysis edit
  const [editingAnalysis, setEditingAnalysis] =
    useState<Partial<Analysis> | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, analysesRes, diseasesRes] = await Promise.all([
          patientService.findById(patientId),
          patientService.findPatientAnalysis(patientId),
          diseaseService.findDiseaseForPatient(patientId),
        ]);
        setPatient(patientRes);
        setAnalyses(analysesRes);
        setDiseases(diseasesRes.results || diseasesRes);
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setPageLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const handleViewClick = async (analysisId: number) => {
    setViewingAnalysisId(analysisId);
    setIsDialogLoading(true);
    setDetailedAnalysisData(null); // Clear previous data
    try {
      const data = await labService.findAnalysisResults({
        analysis_id: analysisId,
        patient_id: patientId,
      });
      setDetailedAnalysisData(data);
    } catch (error) {
      toast.error("Tahlil natijalarini yuklashda xatolik yuz berdi");
      console.error("Failed to fetch analysis details:", error);
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleEditClick = async (analysisId: number) => {
    // Set temporary data with just the ID to open the correct dialog
    setEditingAnalysis({
      id: analysisId,
      status: "n",
      department_types: null,
      files: [],
    });
    setIsEditLoading(true);
    try {
      const data = await labService.findAnalysisResults({
        analysis_id: analysisId,
        patient_id: patientId,
      });
      // Transform data to match what EditAnalysisDialog expects
      const transformedData = {
        id: data.id,
        status: data.status,
        files: data.files,
        department_types: {
          ...data.department_types,
          result: data.results, // Move top-level 'results' into 'department_types.result'
        },
      };
      setEditingAnalysis(transformedData as Partial<Analysis>);
    } catch (error) {
      toast.error("Tahrirlash uchun ma'lumotlarni yuklashda xatolik");
      console.error("Failed to fetch analysis details for edit:", error);
      setEditingAnalysis(null); // Close dialog on error
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSaveSingleResult = async (result: {
    id: number;
    result: number;
    analysis_result: string;
  }) => {
    if (!editingAnalysis) return;
    await analysisResultService.update(result);
  };

  const updateAnalysisStatus = (
    analysisId: number,
    newStatus: "n" | "ip" | "f"
  ) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === analysisId ? { ...a, status: newStatus } : a))
    );
  };

  const handleStatusUpdate = async (newStatus: "n" | "ip" | "f") => {
    if (!editingAnalysis || !editingAnalysis.id) return;
    await labService.updateAnalysis({
      id: editingAnalysis.id,
      dto: { status: newStatus },
    });
    updateAnalysisStatus(editingAnalysis.id, newStatus);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      n: {
        label: "Yangi",
        className: "",
      },
      ip: {
        label: "Jarayonda",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      f: {
        label: "Yakunlangan",
        className: "",
      },
      r: {
        label: "Kutmoqda",
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

  const handlePrint = () => {
    if (!patient || !detailedAnalysisData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Ошибка при открытии окна печати!");
      return;
    }

    const tekshiruvDate = detailedAnalysisData.created_at
      ? new Date(detailedAnalysisData.created_at)
      : null;
    const formattedTekshiruvDate = tekshiruvDate
      ? `${tekshiruvDate.getDate().toString().padStart(2, "0")}.${(
        tekshiruvDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}.${tekshiruvDate.getFullYear()} ${tekshiruvDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${tekshiruvDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
      : "Неизвестно";

    const filteredResults =
      detailedAnalysisData.results?.filter(
        (res: any) => res.analysis_result?.[0]?.analysis_result
      ) || [];

    const resultsHtml =
      filteredResults.length > 0
        ? filteredResults
          .map(
            (res: any, index: number) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td>${res.title}</td>
      <td class="text-center">${res.analysis_result?.[0]?.analysis_result || "-"
              }</td>
      <td class="text-center">${res.norma || "-"}</td>
    </tr>
  `
          )
          .join("")
        : '<tr><td colspan="4" class="text-center">Результаты не найдены.</td></tr>';

    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Результат анализа - ${patient.name} ${patient.last_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        
        body {
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #fff;
          color: #000;
          font-size: 12px;
          -webkit-print-color-adjust: exact;
        }
        
        .print-container {
          width: 210mm;
          margin: 0 auto;
          padding: 10mm 15mm; 
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        
        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 0;
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }

        .header-left img {
          height: 70px;
          object-fit: contain;
        }

        .header-right {
          text-align: right;
          font-size: 12px;
          line-height: 1.4;
          max-width: 350px;
        }
        .header-right b {
          font-weight: 700;
        }

        .info-section {
          margin-bottom: 20px;
        }

        .patient-info-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        .patient-info-table td {
          border: 1px solid #000;
          padding: 5px 8px;
        }

        .label-cell {
          font-weight: 700;
          width: 140px;
        }

        .analysis-title {
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          margin: 20px 0 15px 0;
          text-transform: uppercase;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 10px;
        }
        
        .results-table th, .results-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          background-color: transparent !important;
        }
        
        .results-table th {
          font-weight: 700;
          text-align: center;
        }
        
        .text-center {
          text-align: center;
        }

        .print-footer {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
          font-size: 12px;
          position: relative;
        }

        .signature-block {
          font-size: 13px;
          position: relative;
        }

        .signature-line {
          display: inline-block;
          width: 150px;
          border-bottom: 1px solid #000;
          margin: 0 10px;
          vertical-align: bottom;
        }

        .doctor-name {
          font-weight: bold;
        }

        .pechat-img {
          position: absolute;
          bottom: -80px;
          right: 20px;
          height: 80px;
          width: auto;
        }

        @page {
          size: A4;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        
        <header class="print-header">
          <div class="header-left">
            <img src="${logo}" alt="Logo" />
          </div>
          <div class="header-right">
            <b>АДРЕС:</b> Город Карши, КАТ - МФЙ,<br>
            Улица Насаф, дом 31 <b>ТЕЛ:</b> (75) 223-47-47<br>
            <b>МОБ:</b> (97) 070-47-47 ; (97) 310-21-01
          </div>
        </header>
        
        <main>
          <div class="info-section">
            <table class="patient-info-table">
              <tbody>
                <tr>
                  <td class="label-cell">Ф.И.О. пациента:</td>
                  <td>${patient.last_name} ${patient.name} ${patient.middle_name || ""
      }</td>
                </tr>
                <tr>
                  <td class="label-cell">Дата рождения:</td>
                  <td>${patient.birth_date}</td>
                </tr>
                <tr>
                  <td class="label-cell">Номер телефона:</td>
                  <td>${patient.phone_number}</td>
                </tr>
                <tr>
                  <td class="label-cell">Дата анализа:</td>
                  <td>${formattedTekshiruvDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h1 class="analysis-title">${detailedAnalysisData?.department_types?.title ||
      "РЕЗУЛЬТАТЫ АНАЛИЗОВ"
      } ID: ${patient?.id}</h1>
          
          <table class="results-table">
            <thead>
              <tr>
                <th style="width: 30px;">№</th>
                <th>Название анализа</th>
                <th>Результат анализа</th>
                <th>Норма</th>
              </tr>
            </thead>
            <tbody>
              ${resultsHtml}
            </tbody>
          </table>

          <div class="print-footer">
            <div class="signature-block">
              Врач лаборант: <span class="signature-line"></span> <span class="doctor-name">Давронов Е.Т.</span>
              <img src="${pechat}" alt="Печать" class="pechat-img" />
            </div>
          </div>

        </main>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
  };

  if (pageLoading) {
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

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-500">Bemor topilmadi</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.name} {patient.last_name} Tahlillari
          </h1>
        </div>
        <p className="text-gray-600 text-base">
          Bemorning barcha tahlil natijalari shu yerda ko'rsatiladi.
        </p>
      </div>

      <div className="space-y-4 mb-4">
        {analyses.length > 0 ? (
          analyses.map((analysisItem) => (
            <Card key={analysisItem.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 text-base">
                    {analysisItem.department_types?.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getStatusBadge(analysisItem.status).className
                        }`}
                    >
                      {getStatusBadge(analysisItem.status).label}
                    </Badge>
                    <p
                      className="border px-2 py-1 rounded-md"
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {formattedDate(analysisItem.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Dialog
                    open={viewingAnalysisId === analysisItem.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setViewingAnalysisId(null);
                        setDetailedAnalysisData(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(analysisItem.id)}
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="flex flex-col"
                      style={{
                        maxHeight: "90vh",
                        height: "100%",
                        width: "100%",
                        maxWidth: "90vw",
                        overflowY: "auto",
                      }}
                    >
                      <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            Tahlil Natijalarini Ko'rish
                          </DialogTitle>
                        </div>
                        <DialogDescription className="text-lg text-gray-600 font-medium">
                          <span className="text-blue-600">
                            {patient.name} {patient.last_name}
                          </span>
                          <span className="text-gray-400 mx-2">—</span>
                          <span className="text-indigo-600">
                            {detailedAnalysisData?.department_types.title}
                          </span>
                        </DialogDescription>
                      </DialogHeader>

                      <div>
                        {isDialogLoading ? (
                          <div className="flex justify-center items-center h-40">
                            <p>Yuklanmoqda...</p>
                          </div>
                        ) : detailedAnalysisData ? (
                          <div className="bg-white rounded">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-blue-100">
                                  <TableHead className="font-bold text-blue-900 py-4 text-base border-r border-blue-100">
                                    <div className="flex items-center gap-2">
                                      <List className="w-4 h-4" />
                                      Natija
                                    </div>
                                  </TableHead>
                                  <TableHead className="font-bold text-blue-900 py-4 text-base border-r border-blue-100">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Qiymat
                                    </div>
                                  </TableHead>
                                  <TableHead className="font-bold text-blue-900 py-4 text-base">
                                    <div className="flex items-center gap-2">
                                      <Target className="w-4 h-4" />
                                      Norma
                                    </div>
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {detailedAnalysisData.results?.map(
                                  (res: any, index: number) => {
                                    if (
                                      res.analysis_result?.[0]?.analysis_result
                                    ) {
                                      return (
                                        <TableRow
                                          key={res.id}
                                          className={`
                                        transition-colors duration-200 border-b border-gray-100
                                        ${index % 2 === 0
                                              ? "bg-gray-50/50"
                                              : "bg-white"
                                            }
                                        hover:bg-blue-50/30
                                      `}
                                        >
                                          <TableCell className="font-semibold text-gray-900 py-4 border-r border-gray-100">
                                            <div className="flex items-center gap-3">
                                              <div
                                                className={`w-2 h-2 rounded-full ${res.analysis_result?.[0]
                                                  ?.analysis_result
                                                  ? "bg-green-400"
                                                  : "bg-gray-300"
                                                  }`}
                                              ></div>
                                              {res.title}
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-4 border-r border-gray-100">
                                            <span
                                              className={`
                                            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                            ${res.analysis_result?.[0]
                                                  ?.analysis_result
                                                  ? "bg-green-100 text-green-800 border border-green-200"
                                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                                                }
                                          `}
                                            >
                                              {res.analysis_result?.[0]
                                                ?.analysis_result ||
                                                "Kiritilmagan"}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-gray-700 py-4 font-medium">
                                            {res.norma}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  }
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-500">
                              Tahlil natijalari topilmadi
                            </h3>
                          </div>
                        )}
                      </div>
                      {/* Print and Close Buttons */}
                      {detailedAnalysisData && (
                        <div className="mt-auto pt-6 flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setViewingAnalysisId(null)}
                          >
                            Yopish
                          </Button>
                          <Button onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Chop etish
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={editingAnalysis?.id === analysisItem.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setEditingAnalysis(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(analysisItem.id)}
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      style={{
                        maxHeight: "90vh",
                        height: "100%",
                        width: "100%",
                        maxWidth: "90vw",
                        overflow: "hidden",
                        overflowY: "auto",
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          Tahlilni Tahrirlash
                        </DialogTitle>
                        {editingAnalysis && !isEditLoading && (
                          <DialogDescription>
                            {patient.name} {patient.last_name} —{" "}
                            {editingAnalysis.department_types?.title}
                          </DialogDescription>
                        )}
                      </DialogHeader>
                      {isEditLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <p>Yuklanmoqda...</p>
                        </div>
                      ) : (
                        <EditAnalysisDialog
                          analysis={editingAnalysis}
                          onSave={handleSaveSingleResult}
                          onStatusUpdate={handleStatusUpdate}
                          onClose={() => setEditingAnalysis(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (!id) {
                        toast.error("Bemor malumotlari topilmadi!");
                        return;
                      }
                      const toastId = toast.loading("Fayl yuklanmoqda...");
                      try {
                        await patientService.downloadPatientAnalysisFile({
                          patient_id: parseInt(id, 10),
                          analysis_id: analysisItem.id,
                          filename: `${patient?.name} ${patient?.last_name}`,
                        });
                        toast.success("Fayl muvaffaqiyatli yuklandi.", {
                          id: toastId,
                        });
                      } catch (error) {
                        toast.error("Faylni yuklashda xatolik yuz berdi.", {
                          id: toastId,
                        });
                      }
                    }}
                  >
                    <FileDown />
                  </Button>
                  <Link
                    to={`https://t.me/brosmedsupportbot?text=${id}`}
                    className="flex items-center gap-2"
                  >
                    <span className="p-2 border border-white rounded">
                      Telegramdan olish
                    </span>{" "}
                    <span>
                      <b>ID:</b> {id}
                    </span>
                  </Link>
                </div>
              </div>
              {analysisItem.files && analysisItem.files.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
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
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-500">
              Ushbu bemorda tahlillar mavjud emas
            </h3>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kasallik Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kasallik / Shikoyat</TableHead>
                <TableHead>Bo'lim ID</TableHead>
                <TableHead>Bo'lim Turi ID</TableHead>
                <TableHead>Shifokor ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diseases.length > 0 ? (
                diseases.map((diseaseItem) => (
                  <TableRow key={diseaseItem.id}>
                    <TableCell>{diseaseItem.id}</TableCell>
                    <TableCell>{diseaseItem.disease}</TableCell>
                    <TableCell>
                      {diseaseItem?.department?.title || "-"}
                    </TableCell>
                    <TableCell>
                      {diseaseItem?.department_types?.title || "-"}
                    </TableCell>
                    <TableCell>{diseaseItem.user?.full_name || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Kasallik tarixi mavjud emas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
