import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { cashierService } from "../../services/cashier.service";
import { Skeleton } from "../ui/skeleton";

// Mock data for patients (for "Recent Activity" list, as requested)
const mockPatients = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    department: "Cardiology",
    registrationDate: new Date().toISOString(),
    paymentStatus: "paid",
    paymentAmount: 150000,
    phone: "123456789",
    doctorName: "Dr. Smith",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    department: "Neurology",
    registrationDate: new Date().toISOString(),
    paymentStatus: "pending",
    paymentAmount: 200000,
    phone: "987654321",
    doctorName: "Dr. Jones",
  },
  {
    id: "3",
    firstName: "Alice",
    lastName: "Johnson",
    department: "Pediatrics",
    registrationDate: new Date(Date.now() - 86400000).toISOString(),
    paymentStatus: "partial",
    paymentAmount: 100000,
    partialPaymentAmount: 50000,
    phone: "555555555",
    doctorName: "Dr. Brown",
  },
  {
    id: "4",
    firstName: "Bob",
    lastName: "Williams",
    department: "Orthopedics",
    registrationDate: new Date(Date.now() - 172800000).toISOString(),
    paymentStatus: "paid",
    paymentAmount: 300000,
    phone: "111222333",
    doctorName: "Dr. White",
  },
  {
    id: "5",
    firstName: "Charlie",
    lastName: "Brown",
    department: "Cardiology",
    registrationDate: new Date().toISOString(),
    paymentStatus: "paid",
    paymentAmount: 120000,
    phone: "444555666",
    labTestName: "Blood Test",
  },
];

interface CashierStats {
  bugungi_daromad: string;
  tolangan: string;
  qisman_tolangan: string;
  kutilmoqda: string;
  bugungi_bemorlar: number;
  jami_bemorlar: number;
}

export function CashierDashboard() {
  const [stats, setStats] = useState<CashierStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await cashierService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch cashier stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Keep mock data for "Recent Activity"
  const patients = mockPatients;

  return (
    <div className="space-y-6">
      <div>
        <h1>Kassa boshqaruvi</h1>
        <p className="text-muted-foreground">
          To'lovlar va moliyaviy hisobotlar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Bugungi daromad</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4 mt-1" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.bugungi_daromad || "0 so'm"}</div>
                <p className="text-xs text-muted-foreground">
                  Bugun: {stats?.bugungi_bemorlar || 0} ta bemor
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">To'langan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4 mt-1" />
            ) : (
              <div className="text-2xl font-bold">{stats?.tolangan || "0 so'm"}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Qisman to'langan</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4 mt-1" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.qisman_tolangan || "0 so'm"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Kutilmoqda</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4 mt-1" />
            ) : (
              <div className="text-2xl font-bold">{stats?.kutilmoqda || "0 so'm"}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Oxirgi to'lovlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients
              .filter((p) => p.paymentStatus === "paid")
              .slice(-5)
              .reverse()
              .map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p>
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.department} •{" "}
                      {new Date(patient.registrationDate).toLocaleString(
                        "uz-UZ"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {patient.paymentAmount?.toLocaleString()} so'm
                    </p>
                    <p className="text-xs text-green-600">To'langan</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
