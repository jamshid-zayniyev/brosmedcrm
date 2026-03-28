import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import {
  TestTube,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { labService } from "../../services/lab.service";
import { Analysis } from "../../interfaces/analysis.interface";

interface LabDashboardPageData {
  analyses: Analysis[];
  totalCount: number;
  totalPages: number;
}

interface LabDashboardStats {
  kunlik_tahlil: number;
  jami_tahlil: number;
  yangi_tahlil: number;
  jarayondagi_tahlil: number;
  yakunlangan_tahlil: number;
}

const EMPTY_STATS: LabDashboardStats = {
  kunlik_tahlil: 0,
  jami_tahlil: 0,
  yangi_tahlil: 0,
  jarayondagi_tahlil: 0,
  yakunlangan_tahlil: 0,
};

export function LabDashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const statsQuery = useQuery({
    queryKey: ["lab", "stats"],
    queryFn: labService.getStats,
    staleTime: 5 * 60 * 1000,
  });

  const analysesQuery = useQuery({
    queryKey: ["lab", "analyses", page, limit],
    queryFn: async (): Promise<LabDashboardPageData> => {
      const response = await labService.findAllAnalysis({ page, limit });

      return {
        analyses: response.data || [],
        totalCount: response.total || 0,
        totalPages: response.total_pages || 1,
      };
    },
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (statsQuery.error) {
      toast.error("Laboratoriya statistikalarini yuklashda xatolik yuz berdi");
    }
  }, [statsQuery.error]);

  useEffect(() => {
    if (analysesQuery.error) {
      toast.error("Tahlillar ro'yxatini yuklashda xatolik yuz berdi");
    }
  }, [analysesQuery.error]);

  const stats = statsQuery.data || EMPTY_STATS;
  const analyses = analysesQuery.data?.analyses || [];
  const totalCount = analysesQuery.data?.totalCount || 0;
  const totalPages = analysesQuery.data?.totalPages || 1;
  const isRefreshingAnalyses = analysesQuery.isFetching && Boolean(analysesQuery.data);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((currentPage) => currentPage + 1);
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

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(1)}
        >
          1
        </Button>,
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>,
        );
      }
    }

    for (let currentPage = startPage; currentPage <= endPage; currentPage += 1) {
      pages.push(
        <Button
          key={currentPage}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(currentPage)}
        >
          {currentPage}
        </Button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>,
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
        </Button>,
      );
    }

    return pages;
  };

  const statCards = [
    {
      title: "Jami tahlillar",
      value: stats.jami_tahlil,
      icon: <TestTube className="w-8 h-8" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Yangi",
      value: stats.yangi_tahlil,
      icon: <AlertCircle className="w-8 h-8" />,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Jarayonda",
      value: stats.jarayondagi_tahlil,
      icon: <Clock className="w-8 h-8" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Yakunlangan",
      value: stats.yakunlangan_tahlil,
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
          Bugungi tahlillar: {stats.kunlik_tahlil} ta
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? (
          [...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-14 w-14 rounded-lg" />
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
                    <p className="mb-1 text-muted-foreground">{stat.title}</p>
                    <h2>{stat.value}</h2>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.bg}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Barcha tahlillar</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRefreshingAnalyses ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>Jami: {totalCount} ta</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!analysesQuery.data && analysesQuery.isPending ? (
            <div className="space-y-4">
              {[...Array(limit)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Hozircha tahlillar yo'q
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {analyses.map((analysis) => {
                  const patient = analysis.patient;
                  const resultCount = analysis.department_types?.result?.length || 0;
                  const completedResults =
                    analysis.department_types?.result?.filter(
                      (result) =>
                        result.analysis_result &&
                        result.analysis_result.some(
                          (analysisResult) =>
                            analysisResult.analysis_result.trim() !== "",
                        ),
                    ).length || 0;

                  return (
                    <div
                      key={analysis.id}
                      className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <TestTube className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium">
                                {patient
                                  ? `${patient.name} ${patient.last_name}`
                                  : "Noma'lum bemor"}
                              </p>
                              <Badge
                                className={`flex-shrink-0 text-xs ${
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
                            <p className="truncate text-sm text-muted-foreground">
                              {analysis.department_types?.title_uz ||
                                "Noma'lum tahlil turi"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span>ID: {analysis.id}</span>
                              <span>
                                Natijalar: {completedResults}/{resultCount}
                              </span>
                              {analysis.files && analysis.files.length > 0 ? (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {analysis.files.length} ta fayl
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right text-sm">
                          <div className="whitespace-nowrap text-muted-foreground">
                            {completedResults}/{resultCount} to'ldirilgan
                          </div>
                          <div className="whitespace-nowrap text-xs text-muted-foreground">
                            {resultCount} ta parametr
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
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
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Oldingi
                    </Button>

                    <div className="hidden items-center gap-1 md:flex">
                      {renderPageNumbers()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                    >
                      Keyingi
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
