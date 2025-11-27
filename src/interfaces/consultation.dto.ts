export interface CreateConsultationDto {
  patient: number;
  diagnosis: string;
  recommendation: string;
  recipe: string;
  patient_status: string;
}

export interface UpdateConsultationDto {
  id: number;
  patient_status: string;
}


export interface UpdateConsultationDto {
  id: number;
  patient_status: string;
}
