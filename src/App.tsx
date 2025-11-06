import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { ReceptionDashboard } from './components/reception/ReceptionDashboard';
import { PatientRegistration } from './components/reception/PatientRegistration';
import { PatientQueue } from './components/reception/PatientQueue';
import { LabDashboard } from './components/laboratory/LabDashboard';
import { TestResults } from './components/laboratory/TestResults';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientConsultation } from './components/doctor/PatientConsultation';
import { SuperadminDashboard } from './components/superadmin/SuperadminDashboard';
import { UserManagement } from './components/superadmin/UserManagement';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'superadmin' | 'reception' | 'laboratory' | 'doctor';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  birthDate: string;
  phone: string;
  address: string;
  diseaseType: string;
  department: string;
  doctorId?: string;
  doctorName?: string;
  queueNumber?: number;
  registrationDate: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentAmount?: number;
  status: 'registered' | 'in-lab' | 'with-doctor' | 'completed' | 'under-treatment' | 'cured' | 'discharged' | 'cancelled';
  labResults?: LabResult[];
  consultation?: Consultation;
  history?: PatientHistory[];
}

export interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  result: string;
  files?: string[];
  date: string;
  technicianName: string;
  status: 'new' | 'in-progress' | 'completed';
}

export interface Consultation {
  id: string;
  patientId: string;
  diagnosis: string;
  recommendations: string;
  prescription: string;
  date: string;
  doctorId: string;
  doctorName: string;
}

export interface PatientHistory {
  id: string;
  date: string;
  type: 'registration' | 'lab-test' | 'consultation' | 'payment' | 'status-change';
  description: string;
  doctorName?: string;
  department?: string;
  amount?: number;
  diagnosis?: string;
  recommendations?: string;
  prescription?: string;
  labTest?: string;
  labResult?: string;
  files?: string[];
}

export interface AppContextType {
  user: User | null;
  patients: Patient[];
  labResults: LabResult[];
  consultations: Consultation[];
  doctors: User[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addLabResult: (result: LabResult) => void;
  updateLabResult: (id: string, updates: Partial<LabResult>) => void;
  addConsultation: (consultation: Consultation) => void;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  addPatientHistory: (patientId: string, history: PatientHistory) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [doctors] = useState<User[]>([
    { id: 'd1', username: 'dr.aliyev', role: 'doctor', fullName: 'Dr. Alisher Aliyev' },
    { id: 'd2', username: 'dr.karimova', role: 'doctor', fullName: 'Dr. Nodira Karimova' },
    { id: 'd3', username: 'dr.rahimov', role: 'doctor', fullName: 'Dr. Jamshid Rahimov' },
    { id: 'd4', username: 'dr.yusupova', role: 'doctor', fullName: 'Dr. Dilnoza Yusupova' },
  ]);

  // Mock data - initial patients, lab results, and consultations
  const initialPatients: Patient[] = [
    {
      id: 'p1001',
      firstName: 'Aziza',
      lastName: 'Karimova',
      gender: 'female',
      birthDate: '1985-03-15',
      phone: '+998901234567',
      address: 'Toshkent sh., Yunusobod t., Abdulla Qodiriy ko\'chasi, 12-uy',
      diseaseType: 'Bosh og\'rig\'i, yuqori bosim',
      department: 'Kardiologiya',
      doctorId: 'd1',
      doctorName: 'Dr. Alisher Aliyev',
      queueNumber: 1,
      registrationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 150000,
      status: 'under-treatment',
      history: [
        { id: 'h1', date: '2024-10-15', type: 'Konsultatsiya', description: 'Gipertoniya tashxisi qo\'yildi' }
      ]
    },
    {
      id: 'p1002',
      firstName: 'Jahongir',
      lastName: 'Rahmonov',
      gender: 'male',
      birthDate: '1992-07-22',
      phone: '+998902345678',
      address: 'Toshkent sh., Chilonzor t., Bunyodkor ko\'chasi, 45-uy',
      diseaseType: 'Tizza og\'rig\'i, harakat cheklanganligi',
      department: 'Ortopediya',
      doctorId: 'd3',
      doctorName: 'Dr. Jamshid Rahimov',
      queueNumber: 2,
      registrationDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 200000,
      status: 'in-lab'
    },
    {
      id: 'p1003',
      firstName: 'Malika',
      lastName: 'Yusupova',
      gender: 'female',
      birthDate: '1978-11-08',
      phone: '+998903456789',
      address: 'Toshkent sh., Mirzo Ulug\'bek t., Amir Temur ko\'chasi, 78-uy',
      diseaseType: 'Nevrologik kasallik, qo\'l-oyoq titroq',
      department: 'Nevrologiya',
      doctorId: 'd2',
      doctorName: 'Dr. Nodira Karimova',
      queueNumber: 3,
      registrationDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      paymentStatus: 'partial',
      paymentAmount: 180000,
      status: 'with-doctor'
    },
    {
      id: 'p1004',
      firstName: 'Sanjar',
      lastName: 'Abdullayev',
      gender: 'male',
      birthDate: '2015-05-20',
      phone: '+998904567890',
      address: 'Toshkent sh., Sergeli t., Yangi hayot ko\'chasi, 23-uy',
      diseaseType: 'Shamollash, yuqori harorat',
      department: 'Pediatriya',
      doctorId: 'd4',
      doctorName: 'Dr. Dilnoza Yusupova',
      queueNumber: 4,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 120000,
      status: 'registered'
    },
    {
      id: 'p1005',
      firstName: 'Dilshoda',
      lastName: 'Hamidova',
      gender: 'female',
      birthDate: '1995-09-12',
      phone: '+998905678901',
      address: 'Toshkent sh., Yakkasaroy t., Shota Rustaveli ko\'chasi, 56-uy',
      diseaseType: 'Ko\'z og\'rig\'i, ko\'rish qobiliyati pasayishi',
      department: 'Oftalmologiya',
      doctorId: 'd1',
      doctorName: 'Dr. Alisher Aliyev',
      queueNumber: 5,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'pending',
      paymentAmount: 100000,
      status: 'registered'
    },
    {
      id: 'p1006',
      firstName: 'Bekzod',
      lastName: 'Tursunov',
      gender: 'male',
      birthDate: '1988-02-28',
      phone: '+998906789012',
      address: 'Toshkent sh., Olmazor t., Farobiy ko\'chasi, 89-uy',
      diseaseType: 'Oshqozon og\'rig\'i, hazmsizlik',
      department: 'Terapiya',
      doctorId: 'd2',
      doctorName: 'Dr. Nodira Karimova',
      queueNumber: 1,
      registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 130000,
      status: 'cured'
    },
    {
      id: 'p1007',
      firstName: 'Nigora',
      lastName: 'Saidova',
      gender: 'female',
      birthDate: '1990-12-05',
      phone: '+998907890123',
      address: 'Toshkent sh., Uchtepa t., Bobur ko\'chasi, 34-uy',
      diseaseType: 'Homiladorlik nazorati - 28 haftalik',
      department: 'Ginekologiya',
      doctorId: 'd4',
      doctorName: 'Dr. Dilnoza Yusupova',
      queueNumber: 2,
      registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 250000,
      status: 'completed'
    },
    {
      id: 'p1008',
      firstName: 'Sardor',
      lastName: 'Mirzayev',
      gender: 'male',
      birthDate: '2024-09-15',
      phone: '+998908901234',
      address: 'Toshkent sh., Mirabad t., Navoi ko\'chasi, 67-uy',
      diseaseType: 'Yangi tug\'ilgan chaqaloq tekshiruvi',
      department: 'Pediatriya',
      doctorId: 'd4',
      doctorName: 'Dr. Dilnoza Yusupova',
      queueNumber: 6,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentAmount: 200000,
      status: 'registered'
    }
  ];

  const initialLabResults: LabResult[] = [
    {
      id: 'lr1001',
      patientId: 'p1001',
      testType: 'Biokimyoviy qon tahlili',
      result: 'Xolesterin darajasi: 6.2 mmol/l (yuqori)\nQand miqdori: 5.4 mmol/l (normal)\nKreatinin: 88 μmol/l (normal)',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      technicianName: 'Laborant Malika',
      status: 'completed'
    },
    {
      id: 'lr1002',
      patientId: 'p1002',
      testType: 'Rentgen',
      result: 'Tizza bo\'g\'imida yengil degenerativ o\'zgarishlar kuzatildi. Suyak sinishi belgilari yo\'q.',
      date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      technicianName: 'Laborant Aziz',
      status: 'completed'
    },
    {
      id: 'lr1003',
      patientId: 'p1003',
      testType: 'MRI',
      result: 'Miya to\'qimasida kichik o\'zgarishlar. Qo\'shimcha tekshiruv talab etiladi.',
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      technicianName: 'Laborant Shoxrux',
      status: 'in-progress'
    }
  ];

  const initialConsultations: Consultation[] = [
    {
      id: 'c1001',
      patientId: 'p1006',
      diagnosis: 'Xronik gastrit, kislotalilik oshgan',
      recommendations: 'Ovqatlanish tartibini saqlang, achchiq va yog\'li taomlardan qoching. Stressdan uzoq bo\'ling.',
      prescription: 'Omeprazol 20mg - kuniga 2 marta, 30 kun\nMotilium 10mg - ovqatdan oldin, 20 kun\nDe-Nol - kuniga 2 marta, 4 hafta',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId: 'd2',
      doctorName: 'Dr. Nodira Karimova'
    },
    {
      id: 'c1002',
      patientId: 'p1007',
      diagnosis: 'Normal homiladorlik, 28 haftalik',
      recommendations: 'Muntazam tekshiruvlardan o\'ting. Sog\'lom ovqatlaning, ko\'proq dam oling.',
      prescription: 'Vitamin kompleksi (prenatal) - kuniga 1 dona\nTemir preparati - kuniga 1 dona\nFolik kislota 400mcg - kuniga 1 dona',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId: 'd4',
      doctorName: 'Dr. Dilnoza Yusupova'
    }
  ];

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [labResults, setLabResults] = useState<LabResult[]>(initialLabResults);
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    } else {
      // Initialize with mock data if no saved data
      localStorage.setItem('patients', JSON.stringify(initialPatients));
    }

    const savedLabResults = localStorage.getItem('labResults');
    if (savedLabResults) {
      setLabResults(JSON.parse(savedLabResults));
    } else {
      // Initialize with mock data if no saved data
      localStorage.setItem('labResults', JSON.stringify(initialLabResults));
    }

    const savedConsultations = localStorage.getItem('consultations');
    if (savedConsultations) {
      setConsultations(JSON.parse(savedConsultations));
    } else {
      // Initialize with mock data if no saved data
      localStorage.setItem('consultations', JSON.stringify(initialConsultations));
    }
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('patients', JSON.stringify(patients));
    }
  }, [patients]);

  useEffect(() => {
    if (labResults.length > 0) {
      localStorage.setItem('labResults', JSON.stringify(labResults));
    }
  }, [labResults]);

  useEffect(() => {
    if (consultations.length > 0) {
      localStorage.setItem('consultations', JSON.stringify(consultations));
    }
  }, [consultations]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = (username: string, password: string) => {
    const users: Record<string, User> = {
      'admin': { id: 'sa1', username: 'admin', role: 'superadmin', fullName: 'Superadmin' },
      'reception': { id: 'r1', username: 'reception', role: 'reception', fullName: 'Qabul xonasi' },
      'lab': { id: 'l1', username: 'lab', role: 'laboratory', fullName: 'Laboratoriya' },
      'doctor': { id: 'd1', username: 'doctor', role: 'doctor', fullName: 'Dr. Alisher Aliyev' },
    };

    if (users[username] && password === 'password') {
      setUser(users[username]);
      localStorage.setItem('user', JSON.stringify(users[username]));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('user');
  };

  const addPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addLabResult = (result: LabResult) => {
    setLabResults([...labResults, result]);
    updatePatient(result.patientId, { status: 'in-lab' });
  };

  const updateLabResult = (id: string, updates: Partial<LabResult>) => {
    setLabResults(labResults.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addConsultation = (consultation: Consultation) => {
    setConsultations([...consultations, consultation]);
    updatePatient(consultation.patientId, { status: 'completed' });
  };

  const updateConsultation = (id: string, updates: Partial<Consultation>) => {
    setConsultations(consultations.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addPatientHistory = (patientId: string, history: PatientHistory) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          history: [...(p.history || []), history]
        };
      }
      return p;
    }));
  };

  const context: AppContextType = {
    user,
    patients,
    labResults,
    consultations,
    doctors,
    addPatient,
    updatePatient,
    addLabResult,
    updateLabResult,
    addConsultation,
    updateConsultation,
    addPatientHistory,
    theme,
    toggleTheme,
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'reception') return <ReceptionDashboard context={context} />;
        if (user.role === 'laboratory') return <LabDashboard context={context} />;
        if (user.role === 'doctor') return <DoctorDashboard context={context} />;
        if (user.role === 'superadmin') return <SuperadminDashboard context={context} />;
        break;
      case 'register-patient':
        return <PatientRegistration context={context} />;
      case 'patient-queue':
        return <PatientQueue context={context} />;
      case 'test-results':
        return <TestResults context={context} />;
      case 'consultations':
        return <PatientConsultation context={context} />;
      case 'user-management':
        return <UserManagement context={context} />;
      case 'reports':
        return <ReportsPage context={context} />;
      case 'settings':
        return <SettingsPage context={context} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <>
      <Layout
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
