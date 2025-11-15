import { Consultation } from "./consultation.interface";

export type PatientStatus = 'r' | 'l' | 'd' | 't' | 'f' | 'rc';

// Corresponds to the patient data structure from the API
export interface Patient {
  id: number;
  user?: number;
  department: number;
  department_types?: number;
  name: string;
  last_name: string;
  middle_name: string;
  gender: 'e' | 'a';
  birth_date: string; // "YYYY-MM-DD"
  phone_number: string;
  address: string;
  disease: string;
  disease_uz: string;
  disease_ru: string;
  payment_status: 'p' | 'c' | 'pc';
  patient_status: PatientStatus;
  created_at: string;
  consultations?: Consultation[];
}
