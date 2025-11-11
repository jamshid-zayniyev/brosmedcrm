import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FileText, Download, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

// Mock Data Definitions
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
  { id: 4, name: 'Gulnoza Gulyamova', registrationDate: '2023-10-12', department: 'Pediatriya', paymentAmount: 80000 },
  { id: 5, name: 'Farhod Fozilov', registrationDate: '2023-11-01', department: 'Nevrologiya', paymentAmount: 180000 },
  { id: 6, name: 'Zarina Zokirova', registrationDate: '2023-11-03', department: 'Pediatriya', paymentAmount: 90000 },
  { id: 7, name: 'Botir Botirjonov', registrationDate: '2023-11-05', department: 'Kardiologiya', paymentAmount: 160000 },
  { id: 8, name: 'Dildora Dilshodova', registrationDate: '2023-11-07', department: 'Nevrologiya', paymentAmount: 130000 },
  { id: 9, name: 'Eshmat Eshmatov', registrationDate: '2023-11-10', department: 'Pediatriya', paymentAmount: 100000 },
  { id: 10, name: 'Fotima Fozilova', registrationDate: '2023-11-12', department: 'Kardiologiya', paymentAmount: 170000 },
];

const mockLabResults: LabResult[] = [
  { id: 1, patientId: 1, testName: 'Qon tahlili', date: '2023-10-02' },
  { id: 2, patientId: 2, testName: 'MRT', date: '2023-10-06' },
  { id: 3, patientId: 1, testName: 'EKG', date: '2023-10-03' },
  { id: 4, patientId: 4, testName: 'Siydik tahlili', date: '2023-10-13' },
  { id: 5, patientId: 5, testName: 'Qon tahlili', date: '2023-11-02' },
  { id: 6, patientId: 6, testName: 'MRT', date: '2023-11-04' },
  { id: 7, patientId: 7, testName: 'EKG', date: '2023-11-06' },
  { id: 8, patientId: 8, testName: 'Siydik tahlili', date: '2023-11-08' },
  { id: 9, patientId: 9, testName: 'Qon tahlili', date: '2023-11-11' },
  { id: 10, patientId: 10, testName: 'MRT', date: '2023-11-13' },
];

const mockConsultations: Consultation[] = [
  { id: 1, patientId: 1, doctorId: 101, date: '2023-10-01' },
  { id: 2, patientId: 2, doctorId: 102, date: '2023-10-05' },
  { id: 3, patientId: 3, doctorId: 101, date: '2023-10-10' },
  { id: 4, patientId: 4, doctorId: 103, date: '2023-10-12' },
  { id: 5, patientId: 5, doctorId: 102, date: '2023-11-01' },
  { id: 6, patientId: 6, doctorId: 103, date: '2023-11-03' },
  { id: 7, patientId: 7, doctorId: 101, date: '2023-11-05' },
  { id: 8, patientId: 8, doctorId: 102, date: '2023-11-07' },
  { id: 9, patientId: 9, doctorId: 103, date: '2023-11-10' },
  { id: 10, patientId: 10, doctorId: 101, date: '2023-11-12' },
];

export function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  // Generate report data
  const generateReportData = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalPatients: mockPatients.length,
      newPatients: mockPatients.filter(p => 
        new Date(p.registrationDate) >= weekAgo
      ).length,
      totalConsultations: mockConsultations.length,
      totalLabResults: mockLabResults.length,
      completedConsultations: mockConsultations.filter(c => 
        new Date(c.date) >= weekAgo
      ).length,
    };
  };

  const reportData = generateReportData();

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

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Hisobot ${format.toUpperCase()} formatda yuklab olindi`);
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
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Kunlik</SelectItem>
                  <SelectItem value="weekly">Haftalik</SelectItem>
                  <SelectItem value="monthly">Oylik</SelectItem>
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
                    onSelect={setDateFrom}
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
                    onSelect={setDateTo}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Eksport</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Jami bemorlar</p>
                <h2>{reportData.totalPatients}</h2>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+{reportData.newPatients}</span>
              <span className="text-muted-foreground">yangi</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Konsultatsiyalar</p>
                <h2>{reportData.totalConsultations}</h2>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+{reportData.completedConsultations}</span>
              <span className="text-muted-foreground">bu hafta</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Tahlillar</p>
                <h2>{reportData.totalLabResults}</h2>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">To'lovlar</p>
                <h2>{(mockPatients.reduce((sum, p) => sum + (p.paymentAmount || 0), 0)).toLocaleString()}</h2>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">so'm</p>
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
                {departmentStats.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-accent">
                    <td className="p-2">{dept.name}</td>
                    <td className="text-right p-2">{dept.bemorlar}</td>
                    <td className="text-right p-2">{dept.konsultatsiyalar}</td>
                    <td className="text-right p-2">
                      {mockLabResults.filter(r => {
                        const patient = mockPatients.find(p => p.id === r.patientId);
                        return patient?.department === dept.name;
                      }).length}
                    </td>
                    <td className="text-right p-2">
                      {mockPatients
                        .filter(p => p.department === dept.name)
                        .reduce((sum, p) => sum + (p.paymentAmount || 0), 0)
                        .toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td className="p-2">Jami</td>
                  <td className="text-right p-2">{mockPatients.length}</td>
                  <td className="text-right p-2">{mockConsultations.length}</td>
                  <td className="text-right p-2">{mockLabResults.length}</td>
                  <td className="text-right p-2">
                    {mockPatients.reduce((sum, p) => sum + (p.paymentAmount || 0), 0).toLocaleString()}
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
