import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Users,
  UserCheck,
  TestTube,
  Stethoscope,
  Activity,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { reportService, LineChartStat } from "../../services/report.service";
import { toast } from "sonner";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function SuperadminDashboard() {
  // Mock data (kept for other charts as requested)
  const patients = [
    {
      id: 1,
      department: "Kardiologiya",
      gender: "male",
      firstName: "Ali",
      lastName: "Valiyev",
    },
    {
      id: 2,
      department: "Nevrologiya",
      gender: "female",
      firstName: "Vali",
      lastName: "Aliyev",
    },
    {
      id: 3,
      department: "Kardiologiya",
      gender: "female",
      firstName: "Salima",
      lastName: "Salimova",
    },
    {
      id: 4,
      department: "Ginekologiya",
      gender: "female",
      firstName: "Guli",
      lastName: "Anorova",
    },
    {
      id: 5,
      department: "Urologiya",
      gender: "male",
      firstName: "Sardor",
      lastName: "Kamolov",
    },
  ];
  const labResults = [{ id: 1 }, { id: 2 }];
  const consultations = [
    {
      id: 1,
      patientId: 1,
      doctorName: "Dr. Akmal",
      date: new Date().toISOString(),
    },
    {
      id: 2,
      patientId: 2,
      doctorName: "Dr. Sevara",
      date: new Date().toISOString(),
    },
    {
      id: 3,
      patientId: 3,
      doctorName: "Dr. Akmal",
      date: new Date().toISOString(),
    },
  ];
  const doctors = [{ id: 1 }, { id: 2 }, { id: 3 }];

  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalLabResults: labResults.length,
    totalConsultations: consultations.length,
  };

  // Live data for Department Chart
  const [departmentChartData, setDepartmentChartData] = useState<any[]>([]);
  const [departmentChartLoading, setDepartmentChartLoading] = useState(true);
  const [dailyActivityData, setDailyActivityData] = useState<any[]>([]);
  const [dailyActivityLoading, setDailyActivityLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchDepartmentReport = async () => {
      if (!dateFrom || !dateTo) {
        return;
      }
      setDepartmentChartLoading(true);
      const requestBody = {
        start_date: format(dateFrom, "yyyy-MM-dd"),
        end_date: format(dateTo, "yyyy-MM-dd"),
      };
      try {
        const data = await reportService.getReport(requestBody);
        const chartData = data.departments.map((dept) => ({
          name: dept.department,
          value: dept.jami_bemorlar,
        }));
        setDepartmentChartData(chartData);
      } catch (error) {
        toast.error("Bo'limlar hisobotini olishda xatolik yuz berdi");
        console.error(error);
      } finally {
        setDepartmentChartLoading(false);
      }
    };
    fetchDepartmentReport();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const fetchDailyActivity = async () => {
      setDailyActivityLoading(true);
      try {
        const data = await reportService.reportLineChartStats();
        const formattedData = data.map((item: LineChartStat) => ({
          date: new Date(item.day).toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
          }),
          patients: item.patients,
          consultations: item.consultations,
        }));
        setDailyActivityData(formattedData);
      } catch (error) {
        toast.error("Kunlik faollik yuklanmadi");
      } finally {
        setDailyActivityLoading(false);
      }
    };
    fetchDailyActivity();
  }, []);

  // Mock data for other charts
  const genderData = [
    {
      name: "Erkak",
      value: patients.filter((p) => p.gender === "male").length,
    },
    {
      name: "Ayol",
      value: patients.filter((p) => p.gender === "female").length,
    },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#8884D8"];

  const statCards = [
    {
      title: "Jami bemorlar",
      value: stats.totalPatients,
      icon: <Users className="w-8 h-8" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
      change: "+12%",
    },
    {
      title: "Shifokorlar",
      value: stats.totalDoctors,
      icon: <Stethoscope className="w-8 h-8" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950",
      change: "+5%",
    },
    {
      title: "Tahlillar",
      value: stats.totalLabResults,
      icon: <TestTube className="w-8 h-8" />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
      change: "+18%",
    },
    {
      title: "Konsultatsiyalar",
      value: stats.totalConsultations,
      icon: <UserCheck className="w-8 h-8" />,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
      change: "+8%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Superadmin Dashboard</h1>
        <p className="text-muted-foreground">Tizimning umumiy ko'rinishi</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.title}</p>
                  <h2>{stat.value}</h2>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">{stat.change}</span>
                <span className="text-muted-foreground">oxirgi oyda</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kunlik faollik</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyActivityLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#0088FE"
                    name="Bemorlar"
                  />
                  <Line
                    type="monotone"
                    dataKey="consultations"
                    stroke="#00C49F"
                    name="Konsultatsiyalar"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Jins bo'yicha taqsimot</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Department Distribution with LIVE DATA */}
      <Card>
        <CardHeader>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CardTitle className="p-0">
              Bo'limlar bo'yicha taqsimot
            </CardTitle>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom
                      ? dateFrom.toLocaleDateString("uz-UZ")
                      : "Boshlanish"}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? dateTo.toLocaleDateString("uz-UZ") : "Tugash"}
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
          </div>
        </CardHeader>
        <CardContent>
          {departmentChartLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884D8" name="Bemorlar" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
