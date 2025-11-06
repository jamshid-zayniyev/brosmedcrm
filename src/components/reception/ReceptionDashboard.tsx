import { AppContextType } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCheck, Baby, UserX, Heart, AlertCircle } from 'lucide-react';

interface ReceptionDashboardProps {
  context: AppContextType;
}

export function ReceptionDashboard({ context }: ReceptionDashboardProps) {
  const { patients } = context;

  const stats = {
    total: patients.length,
    male: patients.filter(p => p.gender === 'male').length,
    female: patients.filter(p => p.gender === 'female').length,
    newborns: patients.filter(p => {
      const birthDate = new Date(p.birthDate);
      const monthsOld = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld < 1;
    }).length,
    pregnant: patients.filter(p => p.diseaseType.toLowerCase().includes('homila') || p.diseaseType.toLowerCase().includes('pregnant')).length,
    disabled: patients.filter(p => p.diseaseType.toLowerCase().includes('nogiron') || p.diseaseType.toLowerCase().includes('disabled')).length,
  };

  const todayPatients = patients.filter(p => {
    const today = new Date().toDateString();
    const regDate = new Date(p.registrationDate).toDateString();
    return today === regDate;
  });

  const recentPatients = [...patients].reverse().slice(0, 5);

  const statCards = [
    {
      title: 'Qabul qilinganlar',
      value: stats.total,
      icon: <UserCheck className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Erkaklar',
      value: stats.male,
      icon: <Users className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Ayollar',
      value: stats.female,
      icon: <Users className="w-8 h-8" />,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      title: 'Yangi tug\'ilganlar',
      value: stats.newborns,
      icon: <Baby className="w-8 h-8" />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Homiladorlar',
      value: stats.pregnant,
      icon: <Heart className="w-8 h-8" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Nogironlar',
      value: stats.disabled,
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Qabul Dashboard</h1>
        <p className="text-muted-foreground">
          Bugungi bemorlar: {todayPatients.length} ta
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.title}</p>
                  <h2>{stat.value}</h2>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Oxirgi bemorlar</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha bemorlar yo'q
            </p>
          ) : (
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p>{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.department} • Navbat: {patient.queueNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(patient.registrationDate).toLocaleDateString('uz-UZ')}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          patient.status === 'cured'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                            : patient.status === 'under-treatment'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                            : patient.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : patient.status === 'with-doctor'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : patient.status === 'in-lab'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {patient.status === 'cured'
                          ? 'Sog\'aygan'
                          : patient.status === 'under-treatment'
                          ? 'Davolanmoqda'
                          : patient.status === 'completed'
                          ? 'Yakunlangan'
                          : patient.status === 'with-doctor'
                          ? 'Shifokor oldida'
                          : patient.status === 'in-lab'
                          ? 'Laboratoriyada'
                          : 'Ro\'yxatda'}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          patient.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : patient.paymentStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {patient.paymentStatus === 'paid'
                          ? 'To\'langan'
                          : patient.paymentStatus === 'partial'
                          ? 'Qisman'
                          : 'Kutilmoqda'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
