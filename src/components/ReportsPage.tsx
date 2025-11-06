import { useState } from 'react';
import { AppContextType } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FileText, Download, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportsPageProps {
  context: AppContextType;
}

export function ReportsPage({ context }: ReportsPageProps) {
  const { patients, labResults, consultations } = context;
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  // Generate report data
  const generateReportData = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalPatients: patients.length,
      newPatients: patients.filter(p => 
        new Date(p.registrationDate) >= weekAgo
      ).length,
      totalConsultations: consultations.length,
      totalLabResults: labResults.length,
      completedConsultations: consultations.filter(c => 
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

  const departmentStats = Array.from(new Set(patients.map(p => p.department)))
    .filter(Boolean)
    .map(dept => ({
      name: dept,
      bemorlar: patients.filter(p => p.department === dept).length,
      konsultatsiyalar: consultations.filter(c => {
        const patient = patients.find(p => p.id === c.patientId);
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
                <h2>{(patients.reduce((sum, p) => sum + (p.paymentAmount || 0), 0)).toLocaleString()}</h2>
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
                      {labResults.filter(r => {
                        const patient = patients.find(p => p.id === r.patientId);
                        return patient?.department === dept.name;
                      }).length}
                    </td>
                    <td className="text-right p-2">
                      {patients
                        .filter(p => p.department === dept.name)
                        .reduce((sum, p) => sum + (p.paymentAmount || 0), 0)
                        .toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td className="p-2">Jami</td>
                  <td className="text-right p-2">{patients.length}</td>
                  <td className="text-right p-2">{consultations.length}</td>
                  <td className="text-right p-2">{labResults.length}</td>
                  <td className="text-right p-2">
                    {patients.reduce((sum, p) => sum + (p.paymentAmount || 0), 0).toLocaleString()}
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
