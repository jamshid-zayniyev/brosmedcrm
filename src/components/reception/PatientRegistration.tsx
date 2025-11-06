import { useState } from 'react';
import { AppContextType, Patient } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { UserPlus, Search, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface PatientRegistrationProps {
  context: AppContextType;
}

export function PatientRegistration({ context }: PatientRegistrationProps) {
  const { patients, addPatient, doctors, addPatientHistory } = context;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    phone: '',
    address: '',
    diseaseType: '',
    department: '',
    doctorId: '',
    labTestId: '',
    paymentAmount: '',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'partial',
  });

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

  const handleSearch = () => {
    const found = patients.find(
      (p) =>
        p.phone.includes(searchQuery) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedPatient(found);
      setFormData({
        firstName: found.firstName,
        lastName: found.lastName,
        gender: found.gender,
        birthDate: found.birthDate,
        phone: found.phone,
        address: found.address,
        diseaseType: '',
        department: '',
        doctorId: '',
        labTestId: '',
        paymentAmount: '',
        paymentStatus: 'pending',
      });
      toast.success('Bemor topildi!');
    } else {
      toast.error('Bemor topilmadi');
      setSelectedPatient(null);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFormData({ 
      ...formData, 
      department: value,
      doctorId: '',
      labTestId: '',
      paymentAmount: ''
    });
  };

  const handleDoctorChange = (value: string) => {
    const doctorPrice = doctorPrices[value] || 150000;
    setFormData({ 
      ...formData, 
      doctorId: value,
      paymentAmount: doctorPrice.toString()
    });
  };

  const handleLabTestChange = (value: string) => {
    const labTest = labTests.find(lt => lt.id === value);
    setFormData({ 
      ...formData, 
      labTestId: value,
      paymentAmount: labTest ? labTest.price.toString() : ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const queueNumber = patients.filter(p => p.department === formData.department).length + 1;
    const doctor = doctors.find(d => d.id === formData.doctorId);

    const newPatient: Patient = {
      id: `p${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      birthDate: formData.birthDate,
      phone: formData.phone,
      address: formData.address,
      diseaseType: formData.diseaseType,
      department: formData.department,
      doctorId: formData.doctorId,
      doctorName: doctor?.fullName,
      queueNumber,
      registrationDate: new Date().toISOString(),
      paymentStatus: formData.paymentStatus,
      paymentAmount: parseFloat(formData.paymentAmount) || 0,
      status: formData.department === 'Laboratoriya' ? 'in-lab' : 'registered',
      history: selectedPatient?.history || [],
    };

    addPatient(newPatient);

    // Add to patient history
    const historyEntry = {
      id: `h${Date.now()}`,
      date: new Date().toISOString(),
      type: 'registration' as const,
      description: formData.department === 'Laboratoriya' 
        ? `Laboratoriya tahlili uchun ro'yxatga olindi: ${labTests.find(t => t.id === formData.labTestId)?.name}`
        : `Ro'yxatga olindi - ${formData.department} bo'limi`,
      department: formData.department,
      doctorName: doctor?.fullName,
      amount: parseFloat(formData.paymentAmount) || 0,
    };
    
    addPatientHistory(newPatient.id, historyEntry);

    setReceiptData(newPatient);
    setShowReceipt(true);
    toast.success('Bemor muvaffaqiyatli ro\'yxatga olindi!');

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'male',
      birthDate: '',
      phone: '',
      address: '',
      diseaseType: '',
      department: '',
      doctorId: '',
      labTestId: '',
      paymentAmount: '',
      paymentStatus: 'pending',
    });
    setSelectedPatient(null);
    setSearchQuery('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Bemor ro'yxatga olish</h1>
        <p className="text-muted-foreground">
          Yangi bemor qo'shish yoki mavjud bemorni qidirish
        </p>
      </div>

      {/* Search Existing Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Mavjud bemorni qidirish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Telefon raqam yoki ism-familiya"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Qidirish
            </Button>
          </div>
          {selectedPatient && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p>✓ Bemor topildi: {selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p className="text-sm text-muted-foreground">
                Kasallik tarixi: {selectedPatient.history?.length || 0} ta tashriflar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <UserPlus className="w-5 h-5 inline mr-2" />
            {selectedPatient ? 'Yangi tashrifni ro\'yxatga olish' : 'Yangi bemor ro\'yxatga olish'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={!!selectedPatient}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={!!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jinsi *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                disabled={!!selectedPatient}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Erkak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Ayol</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tug'ilgan sana *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                  disabled={!!selectedPatient}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqami *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={!!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Manzil *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                disabled={!!selectedPatient}
              />
            </div>

            {/* Medical Information */}
            <div className="border-t pt-6">
              <h3 className="mb-4">Tibbiy ma'lumotlar</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diseaseType">Kasallik turi / Shikoyat *</Label>
                  <Textarea
                    id="diseaseType"
                    value={formData.diseaseType}
                    onChange={(e) => setFormData({ ...formData, diseaseType: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Bo'lim *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={handleDepartmentChange}
                      required
                    >
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

                  {formData.department === 'Laboratoriya' ? (
                    <div className="space-y-2">
                      <Label htmlFor="labTest">Tahlil turini tanlang *</Label>
                      <Select
                        value={formData.labTestId}
                        onValueChange={handleLabTestChange}
                        required
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
                      {formData.labTestId && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Tanlangan tahlil:</span>{' '}
                            <span className="font-medium">
                              {labTests.find(t => t.id === formData.labTestId)?.name}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Narx:</span>{' '}
                            <span className="font-medium">
                              {labTests.find(t => t.id === formData.labTestId)?.price.toLocaleString()} so'm
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : formData.department ? (
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Shifokor *</Label>
                      <Select
                        value={formData.doctorId}
                        onValueChange={handleDoctorChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Shifokorni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.fullName} - {doctorPrices[doctor.id]?.toLocaleString() || '150,000'} so'm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.doctorId && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Tanlangan shifokor:</span>{' '}
                            <span className="font-medium">
                              {doctors.find(d => d.id === formData.doctorId)?.fullName}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Ko'rik narxi:</span>{' '}
                            <span className="font-medium">
                              {doctorPrices[formData.doctorId]?.toLocaleString() || '150,000'} so'm
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t pt-6">
              <h3 className="mb-4">To'lov ma'lumotlari</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">To'lov miqdori (so'm) *</Label>
                  <Input
                    id="paymentAmount"
                    type="text"
                    value={formData.paymentAmount ? parseFloat(formData.paymentAmount).toLocaleString() + ' so\'m' : ''}
                    readOnly
                    className="bg-muted"
                    placeholder="Bo'lim va xizmatni tanlang"
                  />
                  <p className="text-xs text-muted-foreground">
                    Narx avtomatik hisoblanadi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">To'lov holati *</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value: 'pending' | 'paid' | 'partial') => 
                      setFormData({ ...formData, paymentStatus: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="paid">To'langan</SelectItem>
                      <SelectItem value="partial">Qisman to'langan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Ro'yxatga olish va check chiqarish
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Qabul check</DialogTitle>
            <DialogDescription>
              Bemorning ro'yxatga olish cheki
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
                  <span className="text-muted-foreground">Navbat raqami:</span>
                  <span>{receiptData.queueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bemor:</span>
                  <span>{receiptData.firstName} {receiptData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bo'lim:</span>
                  <span>{receiptData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shifokor:</span>
                  <span>{receiptData.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sana:</span>
                  <span>{new Date(receiptData.registrationDate).toLocaleString('uz-UZ')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">To'lov:</span>
                  <span>{receiptData.paymentAmount?.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holat:</span>
                  <span className={
                    receiptData.paymentStatus === 'paid' ? 'text-green-600' :
                    receiptData.paymentStatus === 'partial' ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {receiptData.paymentStatus === 'paid' ? 'To\'langan' :
                     receiptData.paymentStatus === 'partial' ? 'Qisman' :
                     'Kutilmoqda'}
                  </span>
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
