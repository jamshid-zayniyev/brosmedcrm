import { useEffect, useState } from "react";
import { consultationService } from "../../services/consultation.service";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Clock, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { Consultation } from "../../interfaces/consultation.interface";
import { PatientStatus } from "../../interfaces/patient.interface";
import { patientService } from "../../services/patient.service";

interface DoctorStats {
  jami_bemorlar: number;
  bugungi_bemorlar: number;
  kutayotgan: number;
  davolanayotgan: number;
  sogaygan: number;
  oxirgi_konsultatsiyalar: Consultation[] | null;
}

export function DoctorDashboard() {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, responseData] = await Promise.all([
          consultationService.findStats(),
          patientService.findAllForDoctor(),
        ]);

        setStats(statsData);

        if (responseData && Array.isArray(responseData.diseases)) {
          setPatientRecords(responseData.diseases);
        } else {
          console.error(
            "Xatolik: 'diseases' ma'lumoti massiv emas!",
            responseData
          );
          setPatientRecords([]);
        }
      } catch (err) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
        console.error(err);
        setPatientRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const upcomingPatients = patientRecords
    .filter(
      (record) =>
        record.patient &&
        (record.patient.patient_status === "r" ||
          record.patient.patient_status === "l" ||
          record.patient.patient_status === "d" ||
          record.patient.patient_status === "t")
    )
    .slice(0, 5);

  const statCards = stats
    ? [
        {
          title: "Jami bemorlar",
          value: stats.jami_bemorlar,
          icon: <Users className="w-8 h-8" />,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950",
        },
        {
          title: "Kutayotgan",
          value: stats.kutayotgan,
          icon: <Clock className="w-8 h-8" />,
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-950",
        },
        {
          title: "Davolanayotgan",
          value: stats.davolanayotgan,
          icon: <Calendar className="w-8 h-8" />,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-50 dark:bg-purple-950",
        },
        {
          title: "Sog'aygan",
          value: stats.sogaygan,
          icon: <CheckCircle className="w-8 h-8" />,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-950",
        },
      ]
    : [];

  const getStatusLabel = (status: PatientStatus) => {
    const statusLabels = {
      r: "Kutmoqda",
      l: "Laboratoriyada",
      d: "Qabulda",
      t: "Davolanmoqda",
      f: "Yakunlangan",
      rc: "Sog'aygan",
    };
    return status ? statusLabels[status] || status : "Noma'lum";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Shifokor Dashboard</h1>
        <p className="text-muted-foreground">
          Bugungi bemorlar: {stats?.bugungi_bemorlar || 0} ta
        </p>
      </div>

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
              {upcomingPatients.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary">№{index + 1}</span>
                    </div>
                    <div>
                      <p>
                        {record.patient?.name} {record.patient?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.disease}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {record.patient?.created_at
                        ? new Date(
                            record.patient.created_at
                          ).toLocaleDateString("uz-UZ")
                        : ""}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        record.patient?.patient_status === "l"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : record.patient?.patient_status === "t"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          : record.patient?.patient_status === "d"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {getStatusLabel(record.patient?.patient_status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {stats &&
        stats.oxirgi_konsultatsiyalar &&
        stats.oxirgi_konsultatsiyalar.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi konsultatsiyalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.oxirgi_konsultatsiyalar.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p>Bemor ID: {consultation.patient}</p>
                      <span className="text-sm text-muted-foreground">
                        {consultation.created_at
                          ? new Date(
                              consultation.created_at
                            ).toLocaleDateString("uz-UZ")
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Diagnoz:</span>{" "}
                      {consultation.diagnosis}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {consultation.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
