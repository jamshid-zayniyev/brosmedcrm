export interface CreateConsultationDto {
  patient: number;
  diagnosis: string;
  diagnosis_uz: string;
  diagnosis_ru: string;
  recommendation: string;
  recommendation_uz: string;
  recommendation_ru: string;
  recipe: string;
  recipe_uz: string;
  recipe_ru: string;
  patient_status: string;
}

export interface UpdateConsultationDto {
  id: number;
  patient_status: string;
}
