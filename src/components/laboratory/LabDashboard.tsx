import { AppContextType } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TestTube, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface LabDashboardProps {
  context: AppContextType;
}

export function LabDashboard({ context }: LabDashboardProps) {
  const { patients, labResults } = context;

  const stats = {
    total: labResults.length,
    new: labResults.filter(r => r.status === 'new').length,
    inProgress: labResults.filter(r => r.status === 'in-progress').length,
    completed: labResults.filter(r => r.status === 'completed').length,
  };

  const todayResults = labResults.filter(r => {
    const today = new Date().toDateString();
    const resultDate = new Date(r.date).toDateString();
    return today === resultDate;
  });

  const recentResults = [...labResults].reverse().slice(0, 5);

  const statCards = [
    {
      title: 'Jami tahlillar',
      value: stats.total,
      icon: <TestTube className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Yangi',
      value: stats.new,
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Jarayonda',
      value: stats.inProgress,
      icon: <Clock className="w-8 h-8" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Yakunlangan',
      value: stats.completed,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Laboratoriya Dashboard</h1>
        <p className="text-muted-foreground">
          Bugungi tahlillar: {todayResults.length} ta
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

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Oxirgi tahlillar</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha tahlillar yo'q
            </p>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => {
                const patient = patients.find(p => p.id === result.patientId);
                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <TestTube className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p>
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum bemor'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.testType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(result.date).toLocaleDateString('uz-UZ')}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : result.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {result.status === 'completed'
                          ? 'Yakunlangan'
                          : result.status === 'in-progress'
                          ? 'Jarayonda'
                          : 'Yangi'}
                      </span>
                    </div>
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
