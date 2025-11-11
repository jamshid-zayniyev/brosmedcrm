import { useState } from 'react';
import { AppContextType, Patient } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Users, Search, Edit, History, PlusCircle, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';

interface PatientQueueProps {
  context: AppContextType;
}

export function PatientQueue({ context }: PatientQueueProps) {
  const { patients, updatePatient, doctors, addPatientHistory } = context;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [editDepartment, setEditDepartment] = useState('');
  const [editDoctorId, setEditDoctorId] = useState('');
  const [editLabTestId, setEditLabTestId] = useState('');
  const [reRegisteringPatient, setReRegisteringPatient] = useState<Patient | null>(null);
  const [reRegisterDepartment, setReRegisterDepartment] = useState('');
  const [reRegisterDoctorId, setReRegisterDoctorId] = useState('');
  const [reRegisterLabTestId, setReRegisterLabTestId] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const departments = [
    'Kardiologiya',
    'Nevrologiya',
    'Ortopediya',
    'Fizioterapiya',
    'Terapiya',
    'Pediatriya',
    'Ginekologiya',
    'Oftalmologiya',
    'Lor',
    'Dermatologiya',
    'Laboratoriya',
  ];

  const labTests = [
    { id: 'lt1', name: 'Umumiy qon tahlili', price: 50000 },
    { id: 'lt2', name: 'Biokimyoviy qon tahlili', price: 120000 },
    { id: 'lt3', name: 'Qand tahlili', price: 30000 },
    { id: 'lt4', name: 'Siydik tahlili', price: 40000 },
    { id: 'lt5', name: 'Rentgen', price: 150000 },
    { id: 'lt6', name: 'Ultrasonografiya (USG)', price: 180000 },
    { id: 'lt7', name: 'MRI', price: 800000 },
    { id: 'lt8', name: 'KT (Kompyuter tomografiya)', price: 650000 },
    { id: 'lt9', name: 'EKG', price: 60000 },
    { id: 'lt10', name: 'Gormon tahlillari', price: 200000 },
  ];

  const doctorPrices: Record<string, number> = {
    'd1': 150000, // Dr. Alisher Aliyev
    'd2': 180000, // Dr. Nodira Karimova
    'd3': 160000, // Dr. Jamshid Rahimov
    'd4': 170000, // Dr. Dilnoza Yusupova
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.queueNumber?.toString().includes(searchQuery);
    
    const matchesDepartment = filterDepartment === 'all' || patient.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'registered': { label: 'Ro\'yxatda', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'in-lab': { label: 'Laboratoriyada', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'with-doctor': { label: 'Shifokor oldida', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'completed': { label: 'Yakunlangan', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'under-treatment': { label: 'Davolanmoqda', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
      'cured': { label: 'Sog\'aygan', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
      'discharged': { label: 'Chiqarilgan', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      'cancelled': { label: 'Bekor qilingan', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    return statusConfig[status] || statusConfig['registered'];
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Kutilmoqda', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      'partial': { label: 'Qisman', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'paid': { label: 'To\'langan', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    return statusConfig[status] || statusConfig['pending'];
  };

  const handleUpdatePayment = (patientId: string, status: 'pending' | 'paid' | 'partial') => {
    updatePatient(patientId, { paymentStatus: status });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditDepartment(patient.department);
    setEditDoctorId(patient.doctorId || '');
    setEditLabTestId('');
    setEditFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: patient.gender,
      birthDate: patient.birthDate,
      phone: patient.phone,
      address: patient.address,
      diseaseType: patient.diseaseType,
      department: patient.department,
      doctorId: patient.doctorId,
      paymentAmount: patient.paymentAmount,
      paymentStatus: patient.paymentStatus,
      status: patient.status,
    });
  };

  const handleEditDepartmentChange = (value: string) => {
    setEditDepartment(value);
    setEditDoctorId('');
    setEditLabTestId('');
    setEditFormData({
      ...editFormData,
      department: value,
      doctorId: '',
      paymentAmount: undefined,
    });
  };

  const handleEditDoctorChange = (value: string) => {
    setEditDoctorId(value);
    const doctorPrice = doctorPrices[value] || 150000;
    setEditFormData({
      ...editFormData,
      doctorId: value,
      paymentAmount: doctorPrice,
    });
  };

  const handleEditLabTestChange = (value: string) => {
    setEditLabTestId(value);
    const labTest = labTests.find(lt => lt.id === value);
    setEditFormData({
      ...editFormData,
      paymentAmount: labTest?.price,
    });
  };

  const handleSaveEdit = () => {
    if (!editingPatient) return;

    const doctor = doctors.find(d => d.id === editDoctorId);
    updatePatient(editingPatient.id, {
      ...editFormData,
      department: editDepartment,
      doctorId: editDepartment === 'Laboratoriya' ? undefined : editDoctorId,
      doctorName: editDepartment === 'Laboratoriya' ? undefined : doctor?.fullName,
    });

    toast.success('Bemor ma\'lumotlari yangilandi');
    setEditingPatient(null);
    setEditFormData({});
    setEditDepartment('');
    setEditDoctorId('');
    setEditLabTestId('');
  };



  const handleReRegisterPatient = () => {
    if (!reRegisteringPatient) return;

    if (reRegisterDepartment === 'Laboratoriya') {
      if (!reRegisterLabTestId) {
        toast.error('Tahlil turini tanlang');
        return;
      }

      const labTest = labTests.find(lt => lt.id === reRegisterLabTestId);
      if (!labTest) return;

      const newPaymentAmount = (reRegisteringPatient.paymentAmount || 0) + labTest.price;
      
      updatePatient(reRegisteringPatient.id, {
        department: reRegisterDepartment,
        labTestId: reRegisterLabTestId,
        labTestName: labTest.name,
        status: 'in-lab',
        paymentAmount: newPaymentAmount,
        paymentStatus: 'pending',
      });

      // Add to patient history
      addPatientHistory(reRegisteringPatient.id, {
        id: `h${Date.now()}`,
        date: new Date().toISOString(),
        type: 'registration',
        description: `Qayta ro'yxatga olindi - Laboratoriya: ${labTest.name}`,
        department: reRegisterDepartment,
        amount: labTest.price,
      });

      // Prepare receipt data
      const receipt = {
        patientName: `${reRegisteringPatient.firstName} ${reRegisteringPatient.lastName}`,
        department: reRegisterDepartment,
        service: labTest.name,
        amount: labTest.price,
        date: new Date().toISOString(),
      };

      setReceiptData(receipt);
      setShowReceipt(true);
      toast.success('Bemor qayta ro\'yxatga olindi');
    } else {
      if (!reRegisterDoctorId) {
        toast.error('Shifokorni tanlang');
        return;
      }

      const doctor = doctors.find(d => d.id === reRegisterDoctorId);
      const doctorPrice = doctorPrices[reRegisterDoctorId] || 150000;
      const newPaymentAmount = (reRegisteringPatient.paymentAmount || 0) + doctorPrice;

      updatePatient(reRegisteringPatient.id, {
        department: reRegisterDepartment,
        doctorId: reRegisterDoctorId,
        doctorName: doctor?.fullName,
        status: 'registered',
        paymentAmount: newPaymentAmount,
        paymentStatus: 'pending',
      });

      // Add to patient history
      addPatientHistory(reRegisteringPatient.id, {
        id: `h${Date.now()}`,
        date: new Date().toISOString(),
        type: 'registration',
        description: `Qayta ro'yxatga olindi - ${reRegisterDepartment} bo'limi`,
        department: reRegisterDepartment,
        doctorName: doctor?.fullName,
        amount: doctorPrice,
      });

      // Prepare receipt data
      const receipt = {
        patientName: `${reRegisteringPatient.firstName} ${reRegisteringPatient.lastName}`,
        department: reRegisterDepartment,
        service: `${doctor?.fullName} ko'rigi`,
        amount: doctorPrice,
        date: new Date().toISOString(),
      };

      setReceiptData(receipt);
      setShowReceipt(true);
      toast.success('Bemor qayta ro\'yxatga olindi');
    }

    // Reset
    setReRegisteringPatient(null);
    setReRegisterDepartment('');
    setReRegisterDoctorId('');
    setReRegisterLabTestId('');
  };

  const handleReRegisterDepartmentChange = (value: string) => {
    setReRegisterDepartment(value);
    setReRegisterDoctorId('');
    setReRegisterLabTestId('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Bemorlar navbati</h1>
        <p className="text-muted-foreground">
          Barcha bemorlar: {patients.length} ta
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish (ism, telefon, navbat raqami)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Bo'lim bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha bo'limlar</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha statuslar</SelectItem>
                <SelectItem value="registered">Ro'yxatda</SelectItem>
                <SelectItem value="in-lab">Laboratoriyada</SelectItem>
                <SelectItem value="with-doctor">Shifokor oldida</SelectItem>
                <SelectItem value="under-treatment">Davolanmoqda</SelectItem>
                <SelectItem value="completed">Yakunlangan</SelectItem>
                <SelectItem value="cured">Sog'aygan</SelectItem>
                <SelectItem value="discharged">Chiqarilgan</SelectItem>
                <SelectItem value="cancelled">Bekor qilingan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Bemorlar topilmadi</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
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
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{patient.department}</Badge>
                        <Badge variant="outline">{patient.doctorName}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusBadge(patient.status).className}>
                          {getStatusBadge(patient.status).label}
                        </Badge>
                        <Badge className={getPaymentBadge(patient.paymentStatus).className}>
                          {getPaymentBadge(patient.paymentStatus).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* View Details Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          Ko'rish
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Bemor ma'lumotlari va tarixi</DialogTitle>
                          <DialogDescription>
                            Bemor haqida to'liq ma'lumot va tibbiy tarix
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPatient && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Ism</p>
                                <p>{selectedPatient.firstName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Familiya</p>
                                <p>{selectedPatient.lastName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Tug'ilgan sana</p>
                                <p>{new Date(selectedPatient.birthDate).toLocaleDateString('uz-UZ')}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Telefon</p>
                                <p>{selectedPatient.phone}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Manzil</p>
                                <p>{selectedPatient.address}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Kasallik</p>
                                <p>{selectedPatient.diseaseType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">To'lov miqdori</p>
                                <p>{selectedPatient.paymentAmount?.toLocaleString()} so'm</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">To'lov holati</p>
                                <Select
                                  value={selectedPatient.paymentStatus}
                                  onValueChange={(value: 'pending' | 'paid' | 'partial') => {
                                    handleUpdatePayment(selectedPatient.id, value);
                                    setSelectedPatient({ ...selectedPatient, paymentStatus: value });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Kutilmoqda</SelectItem>
                                    <SelectItem value="paid">To'langan</SelectItem>
                                    <SelectItem value="partial">Qisman</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Patient History */}
                            {selectedPatient.history && selectedPatient.history.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  <h4 className="flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Bemor tarixi
                                  </h4>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {[...selectedPatient.history].reverse().map((entry) => (
                                      <Card key={entry.id} className="p-3">
                                        <div className="flex justify-between items-start mb-2">
                                          <Badge variant="outline">
                                            {entry.type === 'registration' ? 'Ro\'yxat' :
                                             entry.type === 'lab-test' ? 'Tahlil' :
                                             entry.type === 'consultation' ? 'Konsultatsiya' :
                                             entry.type === 'payment' ? 'To\'lov' : 'O\'zgarish'}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(entry.date).toLocaleString('uz-UZ')}
                                          </span>
                                        </div>
                                        <p className="text-sm mb-1">{entry.description}</p>
                                        {entry.doctorName && (
                                          <p className="text-xs text-muted-foreground">Shifokor: {entry.doctorName}</p>
                                        )}
                                        {entry.diagnosis && (
                                          <div className="mt-2 space-y-1">
                                            <p className="text-xs"><strong>Tashxis:</strong> {entry.diagnosis}</p>
                                            {entry.recommendations && (
                                              <p className="text-xs"><strong>Tavsiyalar:</strong> {entry.recommendations}</p>
                                            )}
                                            {entry.prescription && (
                                              <p className="text-xs"><strong>Retsept:</strong> {entry.prescription}</p>
                                            )}
                                          </div>
                                        )}
                                        {entry.labTest && (
                                          <div className="mt-2">
                                            <p className="text-xs"><strong>Tahlil:</strong> {entry.labTest}</p>
                                            {entry.labResult && (
                                              <p className="text-xs text-muted-foreground mt-1">{entry.labResult}</p>
                                            )}
                                          </div>
                                        )}
                                        {entry.amount && (
                                          <p className="text-xs text-muted-foreground">To'lov: {entry.amount.toLocaleString()} so'm</p>
                                        )}
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Edit Patient Dialog */}
                    <Dialog open={editingPatient?.id === patient.id} onOpenChange={(open) => !open && setEditingPatient(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Tahrirlash
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Bemor ma'lumotlarini tahrirlash</DialogTitle>
                          <DialogDescription>
                            Bemor shaxsiy va tibbiy ma'lumotlarini yangilash
                          </DialogDescription>
                        </DialogHeader>
                        {editingPatient && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-firstName">Ism</Label>
                                <Input
                                  id="edit-firstName"
                                  value={editFormData.firstName || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-lastName">Familiya</Label>
                                <Input
                                  id="edit-lastName"
                                  value={editFormData.lastName || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Jinsi</Label>
                              <RadioGroup
                                value={editFormData.gender}
                                onValueChange={(value: 'male' | 'female') => setEditFormData({ ...editFormData, gender: value })}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="male" id="edit-male" />
                                  <Label htmlFor="edit-male">Erkak</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="female" id="edit-female" />
                                  <Label htmlFor="edit-female">Ayol</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-birthDate">Tug'ilgan sana</Label>
                                <Input
                                  id="edit-birthDate"
                                  type="date"
                                  value={editFormData.birthDate || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefon</Label>
                                <Input
                                  id="edit-phone"
                                  value={editFormData.phone || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-address">Manzil</Label>
                              <Textarea
                                id="edit-address"
                                value={editFormData.address || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-diseaseType">Kasallik / Shikoyat</Label>
                              <Textarea
                                id="edit-diseaseType"
                                value={editFormData.diseaseType || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, diseaseType: e.target.value })}
                              />
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-department">Bo'lim</Label>
                                <Select
                                  value={editDepartment}
                                  onValueChange={handleEditDepartmentChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((dept) => (
                                      <SelectItem key={dept} value={dept}>
                                        {dept}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {editDepartment === 'Laboratoriya' ? (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-labTest">Tahlil turini tanlang</Label>
                                  <Select
                                    value={editLabTestId}
                                    onValueChange={handleEditLabTestChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tahlil tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {labTests.map((test) => (
                                        <SelectItem key={test.id} value={test.id}>
                                          {test.name} - {test.price.toLocaleString()} so'm
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {editLabTestId && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Tanlangan tahlil:</span>{' '}
                                        <span className="font-medium">
                                          {labTests.find(t => t.id === editLabTestId)?.name}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Narx:</span>{' '}
                                        <span className="font-medium">
                                          {labTests.find(t => t.id === editLabTestId)?.price.toLocaleString()} so'm
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : editDepartment ? (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-doctor">Shifokor</Label>
                                  <Select
                                    value={editDoctorId}
                                    onValueChange={handleEditDoctorChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Shifokor tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                          {doctor.fullName} - {doctorPrices[doctor.id]?.toLocaleString() || '150,000'} so'm
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {editDoctorId && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Tanlangan shifokor:</span>{' '}
                                        <span className="font-medium">
                                          {doctors.find(d => d.id === editDoctorId)?.fullName}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Ko'rik narxi:</span>{' '}
                                        <span className="font-medium">
                                          {doctorPrices[editDoctorId]?.toLocaleString() || '150,000'} so'm
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-status">Bemor holati</Label>
                                <Select
                                  value={editFormData.status}
                                  onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="registered">Ro'yxatda</SelectItem>
                                    <SelectItem value="in-lab">Laboratoriyada</SelectItem>
                                    <SelectItem value="with-doctor">Shifokor oldida</SelectItem>
                                    <SelectItem value="under-treatment">Davolanmoqda</SelectItem>
                                    <SelectItem value="completed">Yakunlangan</SelectItem>
                                    <SelectItem value="cured">Sog'aygan</SelectItem>
                                    <SelectItem value="discharged">Chiqarilgan</SelectItem>
                                    <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-paymentAmount">To'lov miqdori</Label>
                                <Input
                                  id="edit-paymentAmount"
                                  type="text"
                                  value={editFormData.paymentAmount ? editFormData.paymentAmount.toLocaleString() + ' so\'m' : ''}
                                  readOnly
                                  className="bg-muted"
                                  placeholder="Bo'lim va xizmatni tanlang"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Narx avtomatik hisoblanadi
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleSaveEdit} className="flex-1">
                                Saqlash
                              </Button>
                              <Button variant="outline" onClick={() => setEditingPatient(null)} className="flex-1">
                                Bekor qilish
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Re-Register Patient Dialog */}
                    <Dialog open={reRegisteringPatient?.id === patient.id} onOpenChange={(open) => !open && setReRegisteringPatient(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setReRegisteringPatient(patient)}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Qayta ro'yxat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Bemorni qayta ro'yxatga olish</DialogTitle>
                          <DialogDescription>
                            Yangi xizmat uchun bemor ro'yxatga olish va check chiqarish
                          </DialogDescription>
                        </DialogHeader>
                        {reRegisteringPatient && (
                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p><strong>Bemor:</strong> {reRegisteringPatient.firstName} {reRegisteringPatient.lastName}</p>
                              <p className="text-sm text-muted-foreground">
                                Joriy to'lov: {reRegisteringPatient.paymentAmount?.toLocaleString()} so'm
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Bo'limni tanlang *</Label>
                                <Select value={reRegisterDepartment} onValueChange={handleReRegisterDepartmentChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bo'limni tanlang" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((dept) => (
                                      <SelectItem key={dept} value={dept}>
                                        {dept}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {reRegisterDepartment === 'Laboratoriya' ? (
                                <div className="space-y-2">
                                  <Label>Tahlil turini tanlang *</Label>
                                  <Select value={reRegisterLabTestId} onValueChange={setReRegisterLabTestId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tahlil tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {labTests.map((test) => (
                                        <SelectItem key={test.id} value={test.id}>
                                          {test.name} - {test.price.toLocaleString()} so'm
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {reRegisterLabTestId && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Tahlil:</span>{' '}
                                        <span className="font-medium">
                                          {labTests.find(t => t.id === reRegisterLabTestId)?.name}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Narx:</span>{' '}
                                        <span className="font-medium">
                                          {labTests.find(t => t.id === reRegisterLabTestId)?.price.toLocaleString()} so'm
                                        </span>
                                      </p>
                                      <p className="text-sm mt-2">
                                        <span className="text-muted-foreground">Yangi umumiy to'lov:</span>{' '}
                                        <span className="font-medium">
                                          {((reRegisteringPatient.paymentAmount || 0) + (labTests.find(t => t.id === reRegisterLabTestId)?.price || 0)).toLocaleString()} so'm
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : reRegisterDepartment ? (
                                <div className="space-y-2">
                                  <Label>Shifokorni tanlang *</Label>
                                  <Select value={reRegisterDoctorId} onValueChange={setReRegisterDoctorId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Shifokor tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                          {doctor.fullName} - {doctorPrices[doctor.id]?.toLocaleString() || '150,000'} so'm
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {reRegisterDoctorId && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Shifokor:</span>{' '}
                                        <span className="font-medium">
                                          {doctors.find(d => d.id === reRegisterDoctorId)?.fullName}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Ko'rik narxi:</span>{' '}
                                        <span className="font-medium">
                                          {doctorPrices[reRegisterDoctorId]?.toLocaleString() || '150,000'} so'm
                                        </span>
                                      </p>
                                      <p className="text-sm mt-2">
                                        <span className="text-muted-foreground">Yangi umumiy to'lov:</span>{' '}
                                        <span className="font-medium">
                                          {((reRegisteringPatient.paymentAmount || 0) + (doctorPrices[reRegisterDoctorId] || 150000)).toLocaleString()} so'm
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={handleReRegisterPatient} 
                                className="flex-1"
                                disabled={!reRegisterDepartment || (reRegisterDepartment === 'Laboratoriya' ? !reRegisterLabTestId : !reRegisterDoctorId)}
                              >
                                Ro'yxatga olish va check chiqarish
                              </Button>
                              <Button variant="outline" onClick={() => setReRegisteringPatient(null)} className="flex-1">
                                Bekor qilish
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <span className="text-sm text-muted-foreground text-right">
                      {new Date(patient.registrationDate).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Qabul check</DialogTitle>
            <DialogDescription>
              Bemorning qabul cheki
            </DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 print:p-8">
              <div className="text-center border-b pb-4">
                <h2>KLINIKA BOSHQARUV TIZIMI</h2>
                <p className="text-muted-foreground">Qabul check</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bemor:</span>
                  <span>{receiptData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bo'lim:</span>
                  <span>{receiptData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Xizmat:</span>
                  <span>{receiptData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sana:</span>
                  <span>{new Date(receiptData.date).toLocaleString('uz-UZ')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">To'lov:</span>
                  <span className="font-medium">{receiptData.amount?.toLocaleString()} so'm</span>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <Button onClick={handlePrintReceipt} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Chop etish
                </Button>
                <Button variant="outline" onClick={() => setShowReceipt(false)} className="flex-1">
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}