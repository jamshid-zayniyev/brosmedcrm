import { useState } from 'react';
import { AppContextType, Consultation } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { Stethoscope, FileText, Pill, History, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

interface PatientConsultationProps {
  context: AppContextType;
}

export function PatientConsultation({ context }: PatientConsultationProps) {
  const { patients, labResults, consultations, addConsultation, updateConsultation, updatePatient, user, addPatientHistory } = context;
  const [selectedPatient, setSelectedPatient] = useState('');
  const [viewingPatient, setViewingPatient] = useState<string | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editingConsultationId, setEditingConsultationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendations: '',
    prescription: '',
  });
  const [editConsultationData, setEditConsultationData] = useState({
    diagnosis: '',
    recommendations: '',
    prescription: '',
  });

  const myPatients = patients.filter(p => p.doctorId === user?.id);
  const availablePatients = myPatients.filter(p => 
    p.status === 'registered' || p.status === 'in-lab' || p.status === 'with-doctor' || p.status === 'under-treatment'
  );

  const handleStartConsultation = (patientId: string) => {
    updatePatient(patientId, { status: 'with-doctor' });
    setSelectedPatient(patientId);
    toast.success('Konsultatsiya boshlandi');
  };

  const handleSubmit = (e: React.FormEvent, finalStatus: 'completed' | 'under-treatment' = 'completed') => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Bemorni tanlang');
      return;
    }

    const consultation: Consultation = {
      id: `c${Date.now()}`,
      patientId: selectedPatient,
      diagnosis: formData.diagnosis,
      recommendations: formData.recommendations,
      prescription: formData.prescription,
      date: new Date().toISOString(),
      doctorId: user?.id || '',
      doctorName: user?.fullName || '',
    };

    addConsultation(consultation);
    updatePatient(selectedPatient, { 
      status: finalStatus,
      consultation 
    });

    // Add to patient history
    addPatientHistory(selectedPatient, {
      id: `h${Date.now()}`,
      date: new Date().toISOString(),
      type: 'consultation',
      description: `Konsultatsiya: ${user?.fullName}`,
      doctorName: user?.fullName,
      diagnosis: formData.diagnosis,
      recommendations: formData.recommendations,
      prescription: formData.prescription,
    });

    toast.success(
      finalStatus === 'under-treatment' 
        ? 'Konsultatsiya yakunlandi. Bemor davolanish jarayonida.' 
        : 'Konsultatsiya yakunlandi.'
    );

    // Reset form
    setFormData({
      diagnosis: '',
      recommendations: '',
      prescription: '',
    });
    setSelectedPatient('');
  };

  const getPatientLabResults = (patientId: string) => {
    return labResults.filter(r => r.patientId === patientId);
  };

  const handleEditPatientStatus = (patientId: string, newStatus: string) => {
    updatePatient(patientId, { status: newStatus });
    toast.success('Bemor statusi yangilandi');
    setEditingPatientId(null);
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'registered': 'Ro\'yxatdan o\'tgan',
      'in-lab': 'Laboratoriyada',
      'with-doctor': 'Qabulda',
      'under-treatment': 'Davolanmoqda',
      'completed': 'Yakunlangan (sog\'aygan)',
      'discharged': 'Chiqarilgan',
      'cancelled': 'Bekor qilingan',
    };
    return statusLabels[status] || status;
  };

  const handleEditConsultationClick = (patientId: string) => {
    const consultation = consultations.find(c => c.patientId === patientId && c.doctorId === user?.id);
    if (consultation) {
      setEditingConsultationId(consultation.id);
      setEditConsultationData({
        diagnosis: consultation.diagnosis,
        recommendations: consultation.recommendations,
        prescription: consultation.prescription,
      });
    }
  };

  const handleEditConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingConsultationId) return;

    updateConsultation(editingConsultationId, {
      diagnosis: editConsultationData.diagnosis,
      recommendations: editConsultationData.recommendations,
      prescription: editConsultationData.prescription,
    });

    toast.success('Konsultatsiya ma\'lumotlari yangilandi');
    setEditingConsultationId(null);
  };

  const getPatientConsultation = (patientId: string) => {
    return consultations.find(c => c.patientId === patientId && c.doctorId === user?.id);
  };

  const selectedPatientData = selectedPatient 
    ? patients.find(p => p.id === selectedPatient) 
    : null;

  const viewingPatientData = viewingPatient
    ? patients.find(p => p.id === viewingPatient)
    : null;

  const editingPatientData = editingPatientId
    ? patients.find(p => p.id === editingPatientId)
    : null;

  const editingConsultation = editingConsultationId
    ? consultations.find(c => c.id === editingConsultationId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1>Bemorlar konsultatsiyasi</h1>
        <p className="text-muted-foreground">
          Sizning bemorlaringiz: {myPatients.length} ta
        </p>
      </div>

      <Tabs defaultValue="consultation">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultation">Yangi konsultatsiya</TabsTrigger>
          <TabsTrigger value="queue">Navbatdagi bemorlar</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Patient Selection & Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Stethoscope className="w-5 h-5 inline mr-2" />
                  Bemorni tanlang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Bemor</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bemorni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          №{patient.queueNumber} - {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatientData && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h3>Bemor ma'lumotlari</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ism-familiya:</span>
                          <span className="text-sm">{selectedPatientData.firstName} {selectedPatientData.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Yoshi:</span>
                          <span className="text-sm">
                            {new Date().getFullYear() - new Date(selectedPatientData.birthDate).getFullYear()} yosh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Jinsi:</span>
                          <span className="text-sm">
                            {selectedPatientData.gender === 'male' ? 'Erkak' : 'Ayol'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Telefon:</span>
                          <span className="text-sm">{selectedPatientData.phone}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4>Shikoyat</h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedPatientData.diseaseType}
                      </p>
                    </div>

                    {getPatientLabResults(selectedPatient).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="mb-2">Laboratoriya natijalari</h4>
                          <div className="space-y-2">
                            {getPatientLabResults(selectedPatient).map((result) => (
                              <div
                                key={result.id}
                                className="p-3 bg-muted rounded-lg text-sm"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span>{result.testType}</span>
                                  <Badge
                                    variant={result.status === 'completed' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {result.status === 'completed' ? 'Tayyor' : 'Jarayonda'}
                                  </Badge>
                                </div>
                                {result.status === 'completed' && (
                                  <p className="text-muted-foreground text-xs line-clamp-2">
                                    {result.result}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedPatientData.history && selectedPatientData.history.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="mb-2">Kasallik tarixi</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedPatientData.history.map((h) => (
                              <div key={h.id} className="text-sm">
                                <span className="text-muted-foreground">
                                  {new Date(h.date).toLocaleDateString('uz-UZ')}:
                                </span>{' '}
                                {h.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultation Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <FileText className="w-5 h-5 inline mr-2" />
                  Konsultatsiya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnoz *</Label>
                    <Textarea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      placeholder="Diagnozni kiriting..."
                      rows={3}
                      required
                      disabled={!selectedPatient}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendations">Tavsiyalar *</Label>
                    <Textarea
                      id="recommendations"
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      placeholder="Tavsiyalarni kiriting..."
                      rows={4}
                      required
                      disabled={!selectedPatient}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescription">Retsept *</Label>
                    <Textarea
                      id="prescription"
                      value={formData.prescription}
                      onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                      placeholder="Dori-darmonlarni kiriting..."
                      rows={4}
                      required
                      disabled={!selectedPatient}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={(e) => handleSubmit(e as any, 'under-treatment')}
                      disabled={!selectedPatient}
                    >
                      <Pill className="w-4 h-4 mr-2" />
                      Davolash davom etsin
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={(e) => handleSubmit(e as any, 'completed')}
                      disabled={!selectedPatient}
                    >
                      Yakunlash
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          {/* Patient Queue */}
          <div className="grid gap-4">
            {availablePatients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Navbatda bemorlar yo'q</p>
                </CardContent>
              </Card>
            ) : (
              availablePatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary">
                            №{patient.queueNumber}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h3>{patient.firstName} {patient.lastName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {patient.gender === 'male' ? 'Erkak' : 'Ayol'} • {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} yosh
                            </p>
                          </div>
                          
                          <p className="text-sm">
                            <span className="text-muted-foreground">Shikoyat:</span> {patient.diseaseType}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={
                                patient.status === 'with-doctor'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : patient.status === 'in-lab'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : patient.status === 'under-treatment'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }
                            >
                              {patient.status === 'with-doctor' 
                                ? 'Qabulda' 
                                : patient.status === 'in-lab'
                                ? 'Laboratoriyada'
                                : patient.status === 'under-treatment'
                                ? 'Davolanmoqda'
                                : 'Kutmoqda'}
                            </Badge>
                            {getPatientLabResults(patient.id).length > 0 && (
                              <Badge variant="outline">
                                {getPatientLabResults(patient.id).length} ta tahlil
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Edit Consultation Dialog */}
                        {getPatientConsultation(patient.id) && (
                          <Dialog open={editingConsultationId === getPatientConsultation(patient.id)?.id} onOpenChange={(open) => !open && setEditingConsultationId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditConsultationClick(patient.id)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Konsultatsiyani tahrirlash
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Konsultatsiya ma'lumotlarini tahrirlash</DialogTitle>
                                <DialogDescription>
                                  Tashxis, tavsiya va retseptni o'zgartirish
                                </DialogDescription>
                              </DialogHeader>
                              {editingConsultation && (
                                <form onSubmit={handleEditConsultationSubmit} className="space-y-6">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Bemor</p>
                                    <p>{patient.firstName} {patient.lastName}</p>
                                  </div>

                                  <Separator />

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-diagnosis">Diagnoz *</Label>
                                    <Textarea
                                      id="edit-diagnosis"
                                      value={editConsultationData.diagnosis}
                                      onChange={(e) => setEditConsultationData({ ...editConsultationData, diagnosis: e.target.value })}
                                      placeholder="Diagnozni kiriting..."
                                      rows={3}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-recommendations">Tavsiyalar *</Label>
                                    <Textarea
                                      id="edit-recommendations"
                                      value={editConsultationData.recommendations}
                                      onChange={(e) => setEditConsultationData({ ...editConsultationData, recommendations: e.target.value })}
                                      placeholder="Tavsiyalarni kiriting..."
                                      rows={4}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-prescription">Retsept *</Label>
                                    <Textarea
                                      id="edit-prescription"
                                      value={editConsultationData.prescription}
                                      onChange={(e) => setEditConsultationData({ ...editConsultationData, prescription: e.target.value })}
                                      placeholder="Dori-darmonlarni kiriting..."
                                      rows={4}
                                      required
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditingConsultationId(null)}
                                    >
                                      Bekor qilish
                                    </Button>
                                    <Button type="submit">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Saqlash
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Edit Patient Status Dialog */}
                        <Dialog open={editingPatientId === patient.id} onOpenChange={(open) => !open && setEditingPatientId(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPatientId(patient.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Statusni tahrirlash
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Bemor statusini tahrirlash</DialogTitle>
                              <DialogDescription>
                                Bemor holatini yangilash
                              </DialogDescription>
                            </DialogHeader>
                            {editingPatientData && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Bemor</p>
                                  <p>{editingPatientData.firstName} {editingPatientData.lastName}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Hozirgi status</p>
                                  <Badge>{getStatusLabel(editingPatientData.status)}</Badge>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                  <Label>Yangi statusni tanlang</Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    <Button
                                      variant={editingPatientData.status === 'with-doctor' ? 'default' : 'outline'}
                                      className="justify-start"
                                      onClick={() => handleEditPatientStatus(patient.id, 'with-doctor')}
                                    >
                                      Qabulda
                                    </Button>
                                    <Button
                                      variant={editingPatientData.status === 'under-treatment' ? 'default' : 'outline'}
                                      className="justify-start"
                                      onClick={() => handleEditPatientStatus(patient.id, 'under-treatment')}
                                    >
                                      Davolanmoqda
                                    </Button>
                                    <Button
                                      variant={editingPatientData.status === 'completed' ? 'default' : 'outline'}
                                      className="justify-start"
                                      onClick={() => handleEditPatientStatus(patient.id, 'completed')}
                                    >
                                      Yakunlangan (sog'aygan)
                                    </Button>
                                    <Button
                                      variant={editingPatientData.status === 'discharged' ? 'default' : 'outline'}
                                      className="justify-start"
                                      onClick={() => handleEditPatientStatus(patient.id, 'discharged')}
                                    >
                                      Chiqarilgan
                                    </Button>
                                    <Button
                                      variant={editingPatientData.status === 'in-lab' ? 'default' : 'outline'}
                                      className="justify-start"
                                      onClick={() => handleEditPatientStatus(patient.id, 'in-lab')}
                                    >
                                      Laboratoriyaga qaytarish
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingPatient(patient.id)}
                            >
                              <History className="w-4 h-4 mr-2" />
                              Ma'lumotlar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>To'liq ma'lumotlar</DialogTitle>
                              <DialogDescription>
                                Bemor va tahlil ma'lumotlari
                              </DialogDescription>
                            </DialogHeader>
                            {viewingPatientData && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Ism-familiya</p>
                                    <p>{viewingPatientData.firstName} {viewingPatientData.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Telefon</p>
                                    <p>{viewingPatientData.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Tug'ilgan sana</p>
                                    <p>{new Date(viewingPatientData.birthDate).toLocaleDateString('uz-UZ')}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Jinsi</p>
                                    <p>{viewingPatientData.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Manzil</p>
                                    <p>{viewingPatientData.address}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Kasallik</p>
                                    <p>{viewingPatientData.diseaseType}</p>
                                  </div>
                                </div>

                                {getPatientLabResults(viewingPatient).length > 0 && (
                                  <div>
                                    <h4 className="mb-2">Tahlil natijalari</h4>
                                    <div className="space-y-2">
                                      {getPatientLabResults(viewingPatient).map((result) => (
                                        <div key={result.id} className="p-3 bg-muted rounded-lg">
                                          <div className="flex items-center justify-between mb-1">
                                            <span>{result.testType}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(result.date).toLocaleDateString('uz-UZ')}
                                            </span>
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {result.result}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {patient.status !== 'with-doctor' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartConsultation(patient.id)}
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Qabul boshlash
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
