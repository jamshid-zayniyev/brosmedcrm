import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCheck, TestTube, Stethoscope, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function SuperadminDashboard() {
  // Mock data
  const patients = [
    { id: 1, department: 'Kardiologiya', gender: 'male' },
    { id: 2, department: 'Nevrologiya', gender: 'female' },
    { id: 3, department: 'Kardiologiya', gender: 'female' },
    { id: 4, department: 'Ginekologiya', gender: 'female' },
    { id: 5, department: 'Urologiya', gender: 'male' },
  ];
  const labResults = [ { id: 1 }, { id: 2 } ];
  const consultations = [
    { id: 1, patientId: 1, doctorName: 'Dr. Akmal', date: new Date().toISOString() },
    { id: 2, patientId: 2, doctorName: 'Dr. Sevara', date: new Date().toISOString() },
    { id: 3, patientId: 3, doctorName: 'Dr. Akmal', date: new Date().toISOString() },
  ];
  const doctors = [ { id: 1 }, { id: 2 }, { id: 3 } ];

  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalLabResults: labResults.length,
    totalConsultations: consultations.length,
  };

  // Data for charts
  const departmentData = Array.from(new Set(patients.map(p => p.department)))
    .filter(Boolean)
    .map(dept => ({
      name: dept,
      value: patients.filter(p => p.department === dept).length,
    }));

  const dailyData = (() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
    });

    return last7Days.map(date => ({
      date,
      patients: Math.floor(Math.random() * 20) + 5,
      consultations: Math.floor(Math.random() * 15) + 3,
    }));
  })();

  const genderData = [
    { name: 'Erkak', value: patients.filter(p => p.gender === 'male').length },
    { name: 'Ayol', value: patients.filter(p => p.gender === 'female').length },
  ];

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884D8'];

  const statCards = [
    {
      title: 'Jami bemorlar',
      value: stats.totalPatients,
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
      change: '+12%',
    },
    {
      title: 'Shifokorlar',
      value: stats.totalDoctors,
      icon: <Stethoscope className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
      change: '+5%',
    },
    {
      title: 'Tahlillar',
      value: stats.totalLabResults,
      icon: <TestTube className="w-8 h-8" />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
      change: '+18%',
    },
    {
      title: 'Konsultatsiyalar',
      value: stats.totalConsultations,
      icon: <UserCheck className="w-8 h-8" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
      change: '+8%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Superadmin Dashboard</h1>
        <p className="text-muted-foreground">
          Tizimning umumiy ko'rinishi
        </p>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#0088FE" name="Bemorlar" />
                <Line type="monotone" dataKey="consultations" stroke="#00C49F" name="Konsultatsiyalar" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bo'limlar bo'yicha taqsimot</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Activity className="w-5 h-5 inline mr-2" />
              Oxirgi faolliklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...consultations].reverse().slice(0, 6).map((consultation, index) => {
                const patient = patients.find(p => p.id === consultation.patientId);
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span>{consultation.doctorName}</span> tomonidan{' '}
                        <span>{patient ? `${patient.firstName} ${patient.lastName}` : 'bemor'}</span>{' '}
                        konsultatsiya qilindi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(consultation.date).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
