import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FileText, Download, Calendar as CalendarIcon, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { reportService, ReportResponse } from '../services/report.service';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Skeleton } from './ui/skeleton';

// Mock Data Definitions (for charts, as requested)
interface Patient {
  id: number;
  name: string;
  registrationDate: string;
  department: string;
  paymentAmount: number;
}

interface LabResult {
  id: number;
  patientId: number;
  testName: string;
  date: string;
}

interface Consultation {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
}

const mockPatients: Patient[] = [
  { id: 1, name: 'Ali Valiyev', registrationDate: '2023-10-01', department: 'Kardiologiya', paymentAmount: 150000 },
  { id: 2, name: 'Vali Aliyev', registrationDate: '2023-10-05', department: 'Nevrologiya', paymentAmount: 120000 },
  { id: 3, name: 'Salim Salimov', registrationDate: '2023-10-10', department: 'Kardiologiya', paymentAmount: 200000 },
];

const mockLabResults: LabResult[] = [
  { id: 1, patientId: 1, testName: 'Qon tahlili', date: '2023-10-02' },
  { id: 2, patientId: 2, testName: 'MRT', date: '2023-10-06' },
];

const mockConsultations: Consultation[] = [
  { id: 1, patientId: 1, doctorId: 101, date: '2023-10-01' },
  { id: 2, patientId: 2, doctorId: 102, date: '2023-10-05' },
];

export function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!dateFrom || !dateTo) {
        return;
      }
      setLoading(true);
      const requestBody = {
        start_date: format(dateFrom, 'yyyy-MM-dd'),
        end_date: format(dateTo, 'yyyy-MM-dd'),
      };
      try {
        const data = await reportService.getReport(requestBody);
        setReportData(data);
      } catch (error) {
        toast.error("Hisobot olishda xatolik yuz berdi");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [dateFrom, dateTo]);

  const handleReportTypeChange = (value: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setReportType(value);
    const today = new Date();
    if (value === 'daily') {
      setDateFrom(today);
      setDateTo(today);
    } else if (value === 'weekly') {
      setDateFrom(startOfWeek(today, { weekStartsOn: 1 }));
      setDateTo(endOfWeek(today, { weekStartsOn: 1 }));
    } else if (value === 'monthly') {
      setDateFrom(startOfMonth(today));
      setDateTo(endOfMonth(today));
    }
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    setReportType('custom');
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    setReportType('custom');
  };

  // Mock data for charts
  const dailyPatients = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
    return {
      date: dateStr,
      bemorlar: Math.floor(Math.random() * 20) + 5,
      konsultatsiyalar: Math.floor(Math.random() * 15) + 3,
      tahlillar: Math.floor(Math.random() * 18) + 4,
    };
  });

  const departmentStats = Array.from(new Set(mockPatients.map(p => p.department)))
    .filter(Boolean)
    .map(dept => ({
      name: dept,
      bemorlar: mockPatients.filter(p => p.department === dept).length,
      konsultatsiyalar: mockConsultations.filter(c => {
        const patient = mockPatients.find(p => p.id === c.patientId);
        return patient?.department === dept;
      }).length,
    }));

  const handleExport = async (formatType: 'pdf' | 'excel') => {
    if (!dateFrom || !dateTo) {
      toast.error("Hisobot sanalarini tanlang.");
      return;
    }

    setExportLoading(true); // Set loading to true
    const startDateFormatted = format(dateFrom, 'yyyy-MM-dd');
    const endDateFormatted = format(dateTo, 'yyyy-MM-dd');

    try {
      let responseBlob: Blob;
      let filename: string;

      if (formatType === 'pdf') {
        responseBlob = await reportService.reportStatsPdf({
          start_date: startDateFormatted,
          end_date: endDateFormatted,
        });
        filename = `hisobot_${startDateFormatted}_${endDateFormatted}.pdf`;
      } else {
        responseBlob = await reportService.reportStatsExcel({
          start_date: startDateFormatted,
          end_date: endDateFormatted,
        });
        filename = `hisobot_${startDateFormatted}_${endDateFormatted}.xlsx`;
      }

      const url = window.URL.createObjectURL(responseBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Hisobot ${formatType.toUpperCase()} formatda yuklab olindi`);
    } catch (error) {
      toast.error("Hisobotni yuklab olishda xatolik yuz berdi.");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false); // Set loading to false
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Hisobotlar</h1>
        <p className="text-muted-foreground">
          Tizim statistikasi va hisobotlar
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Hisobot turi</label>
              <Select value={reportType} onValueChange={handleReportTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Kunlik</SelectItem>
                  <SelectItem value="weekly">Haftalik</SelectItem>
                  <SelectItem value="monthly">Oylik</SelectItem>
                  <SelectItem value="custom">O'z sanasini tanlash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Boshlanish sanasi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? dateFrom.toLocaleDateString('uz-UZ') : 'Tanlang'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={handleDateFromChange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Tugash sanasi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? dateTo.toLocaleDateString('uz-UZ') : 'Tanlang'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={handleDateToChange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 self-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  className="flex-1"
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  className="flex-1"
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-12 w-full" /> :
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Jami bemorlar</p>
                    <h2>{reportData?.umumiy.jami_bemorlar || 0}</h2>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+{mockPatients.length}</span>
                  <span className="text-muted-foreground">yangi</span>
                </div>
              </>
            }
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-12 w-full" /> :
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Konsultatsiyalar</p>
                    <h2>{reportData?.umumiy.konsultatsiyalar || 0}</h2>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+{mockConsultations.length}</span>
                  <span className="text-muted-foreground">bu hafta</span>
                </div>
              </>
            }
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-12 w-full" /> :
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Tahlillar</p>
                    <h2>{reportData?.umumiy.tahlillar || 0}</h2>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+18%</span>
                  <span className="text-muted-foreground">o'sish</span>
                </div>
              </>
            }
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-12 w-full" /> :
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">To'lovlar</p>
                    <h2>{(reportData?.umumiy.tolovlar || 0).toLocaleString()}</h2>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">so'm</p>
              </>
            }
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kunlik statistika (oxirgi 7 kun)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPatients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bemorlar" stroke="#0088FE" name="Bemorlar" />
                <Line type="monotone" dataKey="konsultatsiyalar" stroke="#00C49F" name="Konsultatsiyalar" />
                <Line type="monotone" dataKey="tahlillar" stroke="#FF8042" name="Tahlillar" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bo'limlar bo'yicha statistika</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bemorlar" fill="#8884D8" name="Bemorlar" />
                <Bar dataKey="konsultatsiyalar" fill="#82ca9d" name="Konsultatsiyalar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batafsil hisobot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Bo'lim</th>
                  <th className="text-right p-2">Bemorlar</th>
                  <th className="text-right p-2">Konsultatsiyalar</th>
                  <th className="text-right p-2">Tahlillar</th>
                  <th className="text-right p-2">Daromad (so'm)</th>
                </tr>
              </thead>
              <tbody>
                {loading && !reportData ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-2 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                      <td className="p-2 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                      <td className="p-2 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                      <td className="p-2 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : reportData?.departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Ma'lumotlar topilmadi
                    </td>
                  </tr>
                ) : (
                  reportData?.departments.map((dept, index) => (
                    <tr key={index} className="border-b hover:bg-accent">
                      <td className="p-2">{dept.department}</td>
                      <td className="text-right p-2">{dept.jami_bemorlar}</td>
                      <td className="text-right p-2">{dept.konsultatsiyalar}</td>
                      <td className="text-right p-2">{dept.tahlillar}</td>
                      <td className="text-right p-2">
                        {dept.tolovlar.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="border-t-2 font-bold">
                  <td className="p-2">Jami</td>
                  <td className="text-right p-2">{reportData?.umumiy.jami_bemorlar || 0}</td>
                  <td className="text-right p-2">{reportData?.umumiy.konsultatsiyalar || 0}</td>
                  <td className="text-right p-2">{reportData?.umumiy.tahlillar || 0}</td>
                  <td className="text-right p-2">
                    {(reportData?.umumiy.tolovlar || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
