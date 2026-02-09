import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { TestTube, Clock, CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { labService } from "../../services/lab.service";
import { Analysis } from "../../interfaces/analysis.interface";

export function LabDashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [stats, setStats] = useState<{
    kunlik_tahlil: number;
    jami_tahlil: number;
    yangi_tahlil: number;
    jarayondagi_tahlil: number;
    yakunlangan_tahlil: number;
  }>();

  // Fetch stats only once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await labService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error(error);
        setStats({
          kunlik_tahlil: 0,
          jami_tahlil: 0,
          yangi_tahlil: 0,
          jarayondagi_tahlil: 0,
          yakunlangan_tahlil: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch analyses when page changes
  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      try {
        const response = await labService.findAllAnalysis({ page, limit });
        
        // Backend response structure: { page, limit, total, total_pages, data }
        setAnalyses(response.data || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.total_pages || 1);
      } catch (error) {
        console.error(error);
        setAnalyses([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [page, limit]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={totalPages === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

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
        {statsLoading ? (
          [...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="w-14 h-14 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
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
          ))
        )}
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Barcha tahlillar</CardTitle>
            <div className="text-sm text-muted-foreground">
              Jami: {totalCount} ta
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hozircha tahlillar yo'q
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {analyses.map((analysis) => {
                  const patient = analysis.patient;
                  const resultCount = analysis.department_types?.result?.length || 0;
                  const completedResults = analysis.department_types?.result?.filter(r =>
                    r.analysis_result && r.analysis_result.some(ar => ar.analysis_result.trim() !== "")
                  ).length || 0;

                  return (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <TestTube className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium truncate">
                              {patient
                                ? `${patient.name} ${patient.last_name}`
                                : "Noma'lum bemor"}
                            </p>
                            <Badge
                              className={`text-xs flex-shrink-0 ${
                                analysis.status === "f"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : analysis.status === "ip"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {analysis.status === "f"
                                ? "Yakunlangan"
                                : analysis.status === "ip"
                                ? "Jarayonda"
                                : "Yangi"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {analysis.department_types?.title_uz || "Noma'lum tahlil turi"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
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
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-sm">
                          <div className="text-muted-foreground whitespace-nowrap">
                            {completedResults}/{resultCount} to'ldirilgan
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {resultCount} ta parametr
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
                  <div className="text-sm text-muted-foreground">
                    Sahifa {page} / {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Oldingi
                    </Button>
                    
                    <div className="hidden md:flex items-center gap-1">
                      {renderPageNumbers()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                    >
                      Keyingi
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}