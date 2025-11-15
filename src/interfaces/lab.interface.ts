export interface LabResult {
  id: number;
  patientId: string;
  testType: string;
  result: string;
  status: 'completed' | 'pending';
  date: string;
}
