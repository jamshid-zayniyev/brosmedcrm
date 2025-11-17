export interface DepartmentType {
  id: number;
  department: number;
  title: string;
  title_uz: string;
  title_ru: string;
  price: string;
  result: Result[];
}

export interface Result {
  id: number;
  title: string;
  norma: string;
  analysis_result: AnalysisResult[];
}

export interface AnalysisResult {
  id: number;
  analysis_result: string;
}
