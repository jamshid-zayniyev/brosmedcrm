import { AppContextType } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Clock, CheckCircle, Calendar } from 'lucide-react';

interface DoctorDashboardProps {
  context: AppContextType;
}

export function DoctorDashboard({ context }: DoctorDashboardProps) {
  const { patients, consultations, user } = context;

  const myPatients = patients.filter(p => p.doctorId === user?.id);
  const myConsultations = consultations.filter(c => c.doctorId === user?.id);

  const stats = {
    total: myPatients.length,
    waiting: myPatients.filter(p => p.status === 'registered' || p.status === 'in-lab').length,
    inProgress: myPatients.filter(p => p.status === 'with-doctor' || p.status === 'under-treatment').length,
    completed: myPatients.filter(p => p.status === 'completed' || p.status === 'cured').length,
  };

  const todayPatients = myPatients.filter(p => {
    const today = new Date().toDateString();
    const regDate = new Date(p.registrationDate).toDateString();
    return today === regDate;
  });

  const upcomingPatients = myPatients
    .filter(p => p.status === 'registered' || p.status === 'in-lab' || p.status === 'under-treatment')
    .slice(0, 5);

  const statCards = [
    {
      title: 'Jami bemorlar',
      value: stats.total,
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Kutayotgan',
      value: stats.waiting,
      icon: <Clock className="w-8 h-8" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Qabul/Davolanish',
      value: stats.inProgress,
      icon: <Calendar className="w-8 h-8" />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Sog\'aygan',
      value: stats.completed,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Shifokor Dashboard</h1>
        <p className="text-muted-foreground">
          Bugungi bemorlar: {todayPatients.length} ta
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Upcoming Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Navbatdagi bemorlar</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPatients.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha kutayotgan bemorlar yo'q
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary">
                        №{patient.queueNumber}
                      </span>
                    </div>
                    <div>
                      <p>{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.diseaseType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(patient.registrationDate).toLocaleDateString('uz-UZ')}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === 'in-lab'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : patient.status === 'under-treatment'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                          : patient.status === 'with-doctor'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {patient.status === 'in-lab' 
                        ? 'Laboratoriyada' 
                        : patient.status === 'under-treatment'
                        ? 'Davolanmoqda'
                        : patient.status === 'with-doctor'
                        ? 'Qabulda'
                        : 'Ro\'yxatda'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Oxirgi konsultatsiyalar</CardTitle>
        </CardHeader>
        <CardContent>
          {myConsultations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha konsultatsiyalar yo'q
            </p>
          ) : (
            <div className="space-y-4">
              {[...myConsultations].reverse().slice(0, 5).map((consultation) => {
                const patient = patients.find(p => p.id === consultation.patientId);
                return (
                  <div
                    key={consultation.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p>
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum bemor'}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {new Date(consultation.date).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Diagnoz:</span> {consultation.diagnosis}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {consultation.recommendations}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
