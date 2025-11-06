import { useState } from 'react';
import { AppContextType, LabResult } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { TestTube, Upload, UserCog, BarChart3, TrendingUp, AlertCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

interface TestResultsProps {
  context: AppContextType;
}

export function TestResults({ context }: TestResultsProps) {
  const { patients, labResults, addLabResult, updateLabResult, updatePatient, doctors, user, addPatientHistory } = context;
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [referringPatient, setReferringPatient] = useState<string | null>(null);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [formData, setFormData] = useState({
    testType: '',
    result: '',
    status: 'new' as 'new' | 'in-progress' | 'completed',
  });
  const [editFormData, setEditFormData] = useState({
    testType: '',
    result: '',
    status: 'new' as 'new' | 'in-progress' | 'completed',
  });

  const testTypes = [
    'Umumiy qon tahlili',
    'Biokimyoviy qon tahlili',
    'Siydik tahlili',
    'Rentgen',
    'Ultratovush (USG)',
    'EKG',
    'MRI',
    'CT',
    'Mikrobio tahlil',
    'Gemma tahlili',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Bemorni tanlang');
      return;
    }

    const newResult: LabResult = {
      id: `lr${Date.now()}`,
      patientId: selectedPatient,
      testType: formData.testType,
      result: formData.result,
      date: new Date().toISOString(),
      technicianName: user?.fullName || 'Laborant',
      status: formData.status,
    };

    addLabResult(newResult);

    // Add to patient history
    addPatientHistory(selectedPatient, {
      id: `h${Date.now()}`,
      date: new Date().toISOString(),
      type: 'lab-test',
      description: `Laboratoriya tahlili: ${formData.testType}`,
      labTest: formData.testType,
      labResult: formData.result,
    });

    toast.success('Tahlil natijasi saqlandi');

    // Reset form
    setFormData({
      testType: '',
      result: '',
      status: 'new',
    });
    setSelectedPatient('');
  };

  const handleUpdateStatus = (resultId: string, status: 'new' | 'in-progress' | 'completed') => {
    updateLabResult(resultId, { status });
    toast.success('Status yangilandi');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.success(`${files.length} ta fayl yuklandi`);
    }
  };

  const handleReferToDoctor = (patientId: string, doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    updatePatient(patientId, { 
      doctorId, 
      doctorName: doctor?.fullName,
      status: 'with-doctor'
    });
    toast.success(`Bemor ${doctor?.fullName}ga yo'naltirildi`);
    setReferringPatient(null);
  };

  const handleEditClick = (result: LabResult) => {
    setEditingResult(result);
    setEditFormData({
      testType: result.testType,
      result: result.result,
      status: result.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingResult) return;

    updateLabResult(editingResult.id, {
      testType: editFormData.testType,
      result: editFormData.result,
      status: editFormData.status,
    });

    toast.success('Tahlil natijasi yangilandi');
    setEditingResult(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'new': { label: 'Yangi', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      'in-progress': { label: 'Jarayonda', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'completed': { label: 'Yakunlangan', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    return statusConfig[status] || statusConfig['new'];
  };

  const analyzeTestResult = (result: LabResult) => {
    const analysis = {
      concerns: [] as string[],
      recommendations: [] as string[],
    };

    const resultText = result.result.toLowerCase();

    // Simple analysis based on keywords
    if (resultText.includes('yuqori') || resultText.includes('oshgan')) {
      analysis.concerns.push('Ko\'rsatkichlar me\'yordan yuqori');
      analysis.recommendations.push('Shifokor konsultatsiyasi tavsiya etiladi');
    }

    if (resultText.includes('past') || resultText.includes('kamaygan')) {
      analysis.concerns.push('Ko\'rsatkichlar me\'yordan past');
      analysis.recommendations.push('Qo\'shimcha tekshiruvlar kerak bo\'lishi mumkin');
    }

    if (resultText.includes('normal')) {
      analysis.recommendations.push('Natijalar me\'yor doirasida');
    }

    if (resultText.includes('degenerativ') || resultText.includes('o\'zgarish')) {
      analysis.concerns.push('Patologik o\'zgarishlar aniqlandi');
      analysis.recommendations.push('Mutaxassis ko\'rigidan o\'tish zarur');
    }

    return analysis;
  };

  const registeredPatients = patients.filter(p => p.status === 'registered' || p.status === 'in-lab');

  return (
    <div className="space-y-6">
      <div>
        <h1>Tahlillar va tekshiruvlar</h1>
        <p className="text-muted-foreground">
          Bemorlar uchun tahlil natijalarini kiriting va tahlil qiling
        </p>
      </div>

      <Tabs defaultValue="new">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Yangi tahlil</TabsTrigger>
          <TabsTrigger value="list">Barcha tahlillar</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {/* New Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TestTube className="w-5 h-5 inline mr-2" />
                Yangi tahlil kiritish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patient">Bemorni tanlang *</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bemorni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} - {patient.department} (Navbat: {patient.queueNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testType">Tahlil turi *</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value) => setFormData({ ...formData, testType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tahlil turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Tahlil natijasi *</Label>
                  <Textarea
                    id="result"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    placeholder="Tahlil natijasini kiriting..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'new' | 'in-progress' | 'completed') => 
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Yangi</SelectItem>
                      <SelectItem value="in-progress">Jarayonda</SelectItem>
                      <SelectItem value="completed">Yakunlangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Fayllar (ixtiyoriy)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="files" className="cursor-pointer">
                      <span className="text-primary">Fayl tanlash</span> yoki bu yerga tashlang
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, PDF (maks. 10MB)
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <TestTube className="w-4 h-4 mr-2" />
                  Tahlilni saqlash
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Results List */}
          <div className="grid gap-4">
            {labResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Hozircha tahlillar yo'q</p>
                </CardContent>
              </Card>
            ) : (
              [...labResults].reverse().map((result) => {
                const patient = patients.find(p => p.id === result.patientId);
                const analysis = analyzeTestResult(result);
                
                return (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TestTube className="w-6 h-6 text-primary" />
                          </div>
                          
                          <div className="space-y-2 flex-1">
                            <div>
                              <h3>
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum bemor'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {result.testType}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusBadge(result.status).className}>
                                {getStatusBadge(result.status).label}
                              </Badge>
                              <Badge variant="outline">{result.technicianName}</Badge>
                              <Badge variant="outline">
                                {new Date(result.date).toLocaleDateString('uz-UZ')}
                              </Badge>
                            </div>

                            {/* AI Analysis Preview */}
                            {result.status === 'completed' && (analysis.concerns.length > 0 || analysis.recommendations.length > 0) && (
                              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                      Tahlil: {analysis.concerns.length > 0 ? analysis.concerns[0] : analysis.recommendations[0]}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <p className="text-sm mt-2 line-clamp-2">
                              {result.result}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* Edit Dialog */}
                          <Dialog open={editingResult?.id === result.id} onOpenChange={(open) => !open && setEditingResult(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(result)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Tahrirlash
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Tahlil natijasini tahrirlash</DialogTitle>
                                <DialogDescription>
                                  Tahlil natijalarini o'zgartirish
                                </DialogDescription>
                              </DialogHeader>
                              {editingResult && (
                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-testType">Tahlil turi *</Label>
                                    <Select
                                      value={editFormData.testType}
                                      onValueChange={(value) => setEditFormData({ ...editFormData, testType: value })}
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {testTypes.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-result">Tahlil natijasi *</Label>
                                    <Textarea
                                      id="edit-result"
                                      value={editFormData.result}
                                      onChange={(e) => setEditFormData({ ...editFormData, result: e.target.value })}
                                      placeholder="Tahlil natijasini kiriting..."
                                      rows={8}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status *</Label>
                                    <Select
                                      value={editFormData.status}
                                      onValueChange={(value: 'new' | 'in-progress' | 'completed') => 
                                        setEditFormData({ ...editFormData, status: value })
                                      }
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">Yangi</SelectItem>
                                        <SelectItem value="in-progress">Jarayonda</SelectItem>
                                        <SelectItem value="completed">Yakunlangan</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditingResult(null)}
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

                          {/* View & Analyze Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedResult(result)}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Tahlil qilish
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Tahlil natijasi va tahlil</DialogTitle>
                                <DialogDescription>
                                  Tahlil to'liq ma'lumotlari
                                </DialogDescription>
                              </DialogHeader>
                              {selectedResult && (
                                <div className="space-y-6">
                                  {/* Patient & Test Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Bemor</p>
                                      <p>
                                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Tahlil turi</p>
                                      <p>{selectedResult.testType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Sana</p>
                                      <p>{new Date(selectedResult.date).toLocaleString('uz-UZ')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Laborant</p>
                                      <p>{selectedResult.technicianName}</p>
                                    </div>
                                  </div>
                                  
                                  <Separator />

                                  {/* Test Result */}
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Natija</p>
                                    <div className="p-4 bg-muted rounded-lg">
                                      <p className="whitespace-pre-wrap">{selectedResult.result}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* AI Analysis */}
                                  {analyzeTestResult(selectedResult).concerns.length > 0 || analyzeTestResult(selectedResult).recommendations.length > 0 ? (
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        <h4>Avtomatik tahlil</h4>
                                      </div>

                                      {analyzeTestResult(selectedResult).concerns.length > 0 && (
                                        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                          <p className="text-sm mb-2">E'tiborga olish kerak:</p>
                                          <ul className="list-disc list-inside space-y-1">
                                            {analyzeTestResult(selectedResult).concerns.map((concern, idx) => (
                                              <li key={idx} className="text-sm text-red-800 dark:text-red-200">
                                                {concern}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {analyzeTestResult(selectedResult).recommendations.length > 0 && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                          <p className="text-sm mb-2">Tavsiyalar:</p>
                                          <ul className="list-disc list-inside space-y-1">
                                            {analyzeTestResult(selectedResult).recommendations.map((rec, idx) => (
                                              <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                                                {rec}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                      <p className="text-sm text-muted-foreground">
                                        Hozircha avtomatik tahlil mavjud emas
                                      </p>
                                    </div>
                                  )}

                                  <Separator />

                                  {/* Status Update */}
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                                    <Select
                                      value={selectedResult.status}
                                      onValueChange={(value: 'new' | 'in-progress' | 'completed') => {
                                        handleUpdateStatus(selectedResult.id, value);
                                        setSelectedResult({ ...selectedResult, status: value });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">Yangi</SelectItem>
                                        <SelectItem value="in-progress">Jarayonda</SelectItem>
                                        <SelectItem value="completed">Yakunlangan</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Refer to Doctor */}
                          {patient && result.status === 'completed' && (
                            <Dialog open={referringPatient === result.patientId} onOpenChange={(open) => !open && setReferringPatient(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setReferringPatient(result.patientId)}
                                >
                                  <UserCog className="w-4 h-4 mr-2" />
                                  Doctorga yo'naltirish
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Doctorga yo'naltirish</DialogTitle>
                                  <DialogDescription>
                                    Bemorni shifokorga yo'naltirish
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Bemor</p>
                                    <p>{patient.firstName} {patient.lastName}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Hozirgi shifokor</p>
                                    <p>{patient.doctorName || 'Tayinlanmagan'}</p>
                                  </div>

                                  <Separator />

                                  <div className="space-y-2">
                                    <Label>Yangi shifokorni tanlang</Label>
                                    <div className="space-y-2">
                                      {doctors.map((doctor) => (
                                        <Button
                                          key={doctor.id}
                                          variant="outline"
                                          className="w-full justify-start"
                                          onClick={() => handleReferToDoctor(result.patientId, doctor.id)}
                                        >
                                          <UserCog className="w-4 h-4 mr-2" />
                                          {doctor.fullName}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Quick Status Update */}
                          <Select
                            value={result.status}
                            onValueChange={(value: 'new' | 'in-progress' | 'completed') =>
                              handleUpdateStatus(result.id, value)
                            }
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Yangi</SelectItem>
                              <SelectItem value="in-progress">Jarayonda</SelectItem>
                              <SelectItem value="completed">Yakunlangan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
