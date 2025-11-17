import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TestTube, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { labService } from "../../services/lab.service";
import { Analysis } from "../../interfaces/analysis.interface";

export function LabDashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<{
    kunlik_tahlil: number;
    jami_tahlil: number;
    yangi_tahlil: number;
    jarayondagi_tahlil: number;
    yakunlangan_tahlil: number;
  }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analysesData] = await Promise.all([
          labService.getStats(),
          labService.findAllAnalysis(),
        ]);
        setStats(statsData);
        setAnalyses(analysesData);
      } catch (error) {
        console.error(error);
        setStats({
          kunlik_tahlil: 0,
          jami_tahlil: 0,
          yangi_tahlil: 0,
          jarayondagi_tahlil: 0,
          yakunlangan_tahlil: 0,
        });
        setAnalyses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Jami tahlillar",
      value: stats?.jami_tahlil || 0,
      icon: <TestTube className="w-8 h-8" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Yangi",
      value: stats?.yangi_tahlil || 0,
      icon: <AlertCircle className="w-8 h-8" />,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Jarayonda",
      value: stats?.jarayondagi_tahlil || 0,
      icon: <Clock className="w-8 h-8" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Yakunlangan",
      value: stats?.yakunlangan_tahlil || 0,
      icon: <CheckCircle className="w-8 h-8" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Laboratoriya Dashboard</h1>
        <p className="text-muted-foreground">
          Bugungi tahlillar: {stats?.kunlik_tahlil || 0} ta
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

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Barcha tahlillar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha tahlillar yo'q
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...analyses].reverse().map((analysis) => {
                const patient = analysis.patient;
                const resultCount = analysis.department_types?.result?.length || 0;
                const completedResults = analysis.department_types?.result?.filter(r =>
                  r.analysis_result && r.analysis_result.some(ar => ar.analysis_result.trim() !== "")
                ).length || 0;

                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <TestTube className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {patient
                              ? `${patient.name} ${patient.last_name}`
                              : "Noma'lum bemor"}
                          </p>
                          <Badge
                            className={`text-xs ${
                              analysis.status === "f"
                                ? "bg-green-100 text-green-800"
                                : analysis.status === "ip"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {analysis.status === "f"
                              ? "Yakunlangan"
                              : analysis.status === "ip"
                              ? "Jarayonda"
                              : "Yangi"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {analysis.department_types?.title_uz || "Noma'lum tahlil turi"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>ID: {analysis.id}</span>
                          <span>Natijalar: {completedResults}/{resultCount}</span>
                          {analysis.files && analysis.files.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {analysis.files.length} ta fayl
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <div className="text-muted-foreground">
                          {completedResults}/{resultCount} to'ldirilgan
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {resultCount} ta parametr
                        </div>
                      </div>
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
