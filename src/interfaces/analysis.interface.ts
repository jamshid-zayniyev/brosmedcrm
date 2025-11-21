import { DepartmentType } from "./department-type.interface";
import { Patient } from "./patient.interface";

export interface Analysis {
  id: number;
  patient: Patient;
  department_types: DepartmentType | null;
  analysis_result: string;
  analysis_result_uz: string;
  analysis_result_ru: string;
  status: "n" | "ip" | "f";
  files: {
    id: number;
    file: string;
  }[];
}
