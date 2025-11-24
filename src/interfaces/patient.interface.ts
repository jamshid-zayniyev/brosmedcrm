import { Analysis } from "./analysis.interface";
import { Consultation } from "./consultation.interface";
import { DepartmentType } from "./department-type.interface";
import { User } from "./user.interface";

// Assuming PatientStatus is a string based on its usage.
// If it's more complex, it should have its own interface file.
export type PatientStatus = "r" | "l" | "d" | "t" | "f" | "rc";

export interface Patient {
  id: number;
  user?: User | number;
  department: number;
  department_types?: DepartmentType | number;
  name: string;
  last_name: string;
  middle_name: string;
  gender: "e" | "a";
  birth_date: string; // "YYYY-MM-DD"
  phone_number: string;
  address: string;
  disease: string;
  disease_uz: string;
  disease_ru: string;
  payment_status: "p" | "c" | "pc";
  patient_status: PatientStatus;
  created_at: string;
  consultations?: Consultation[];
  analysis: Analysis[];
}
