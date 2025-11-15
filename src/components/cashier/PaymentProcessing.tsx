import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  DollarSign,
  Printer,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";

// Mock data for patients
const mockPatients: Patient[] = [
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

// Mock Patient type
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  registrationDate: string;
  paymentStatus: "pending" | "paid" | "partial";
  paymentAmount?: number;
  partialPaymentAmount?: number;
  phone: string;
  labTestName?: string;
  doctorName?: string;
}

export function PaymentProcessing() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };
  const addPatientHistory = (id: string, record: any) => {
    console.log(`Adding history for patient ${id}:`, record);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "partial"
  >("pending");
  const [partialAmount, setPartialAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleSearch = () => {
    const found = patients.find(
      (p) =>
        p.phone.includes(searchQuery) ||
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.id.includes(searchQuery)
    );

    if (found) {
      setSelectedPatient(found);
      setPaymentStatus(found.paymentStatus);
      setPartialAmount(found.partialPaymentAmount?.toString() || "");
      toast.success("Bemor topildi!");
    } else {
      toast.error("Bemor topilmadi");
      setSelectedPatient(null);
    }
  };

  const handleProcessPayment = () => {
    if (!selectedPatient) {
      toast.error("Bemorni tanlang");
      return;
    }

    let updatedPartialAmount = selectedPatient.partialPaymentAmount || 0;

    if (paymentStatus === "partial") {
      const amount = parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        toast.error("To'lov miqdorini kiriting");
        return;
      }
      if (amount >= (selectedPatient.paymentAmount || 0)) {
        toast.error("Qisman to'lov to'liq miqdordan kam bo'lishi kerak");
        return;
      }
      updatedPartialAmount = amount;
    }

    // Update patient payment status
    updatePatient(selectedPatient.id, {
      paymentStatus,
      partialPaymentAmount:
        paymentStatus === "partial" ? updatedPartialAmount : undefined,
    });

    // Add to patient history
    addPatientHistory(selectedPatient.id, {
      id: `h${Date.now()}`,
      date: new Date().toISOString(),
      type: "payment",
      description:
        paymentStatus === "paid"
          ? "To'lov to'liq qabul qilindi"
          : paymentStatus === "partial"
          ? `Qisman to\'lov qabul qilindi: ${updatedPartialAmount.toLocaleString()} so'm`
          : "To'lov kutilmoqda",
      amount:
        paymentStatus === "partial"
          ? updatedPartialAmount
          : selectedPatient.paymentAmount,
    });

    // Prepare receipt
    const receipt = {
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientId: selectedPatient.id,
      department: selectedPatient.department,
      service:
        selectedPatient.labTestName ||
        (selectedPatient.doctorName
          ? `${selectedPatient.doctorName} ko'rigi`
          : "Xizmat"),
      totalAmount: selectedPatient.paymentAmount,
      paidAmount:
        paymentStatus === "paid"
          ? selectedPatient.paymentAmount
          : updatedPartialAmount,
      remainingAmount:
        paymentStatus === "partial"
          ? (selectedPatient.paymentAmount || 0) - updatedPartialAmount
          : 0,
      paymentStatus:
        paymentStatus === "paid"
          ? "To'langan"
          : paymentStatus === "partial"
          ? "Qisman to'langan"
          : "Kutilmoqda",
      date: new Date().toISOString(),
    };

    setReceiptData(receipt);
    setShowReceipt(true);
    toast.success("To'lov muvaffaqiyatli amalga oshirildi!");

    // Reset
    setSelectedPatient(null);
    setSearchQuery("");
    setPaymentStatus("pending");
    setPartialAmount("");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      pending: {
        label: "Kutilmoqda",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: AlertCircle,
      },
      partial: {
        label: "Qisman",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: Clock,
      },
      paid: {
        label: "To'langan",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: Check,
      },
    };
    return statusConfig[status] || statusConfig["pending"];
  };

  const filteredPatients =
    filterStatus === "all"
      ? patients
      : patients.filter((p) => p.paymentStatus === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1>To'lov qabul qilish</h1>
        <p className="text-muted-foreground">
          Bemorlardan to'lov qabul qiling va check chiqaring
        </p>
      </div>

      {/* Search Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Bemorni qidirish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Telefon, ism-familiya yoki ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Qidirish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>
              <DollarSign className="w-5 h-5 inline mr-2" />
              To'lov qabul qilish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bemor:</span>
                <span>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{selectedPatient.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bo'lim:</span>
                <span>{selectedPatient.department}</span>
              </div>
              {selectedPatient.labTestName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tahlil:</span>
                  <span>{selectedPatient.labTestName}</span>
                </div>
              )}
              {selectedPatient.doctorName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shifokor:</span>
                  <span>{selectedPatient.doctorName}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Umumiy to'lov:</span>
                <span className="font-medium">
                  {selectedPatient.paymentAmount?.toLocaleString()} so'm
                </span>
              </div>
              {selectedPatient.partialPaymentAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To'langan:</span>
                  <span className="text-green-600">
                    {selectedPatient.partialPaymentAmount.toLocaleString()} so'm
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joriy holat:</span>
                <Badge
                  className={
                    getPaymentBadge(selectedPatient.paymentStatus).className
                  }
                >
                  {getPaymentBadge(selectedPatient.paymentStatus).label}
                </Badge>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To'lov holati *</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(value: "pending" | "paid" | "partial") =>
                    setPaymentStatus(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">To'liq to'landi</SelectItem>
                    <SelectItem value="partial">Qisman to'landi</SelectItem>
                    <SelectItem value="pending">To'lanmadi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentStatus === "partial" && (
                <div className="space-y-2">
                  <Label>Qisman to'lov miqdori (so'm) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    max={selectedPatient.paymentAmount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: {selectedPatient.paymentAmount?.toLocaleString()}{" "}
                    so'm
                  </p>
                  {partialAmount && parseFloat(partialAmount) > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          Qolgan summa:
                        </span>{" "}
                        <span className="font-medium">
                          {(
                            (selectedPatient.paymentAmount || 0) -
                            parseFloat(partialAmount)
                          ).toLocaleString()}{" "}
                          so'm
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm">
                    ✓ To'lov to'liq qabul qilinadi:{" "}
                    <span className="font-medium">
                      {selectedPatient.paymentAmount?.toLocaleString()} so'm
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Button onClick={handleProcessPayment} className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              To'lovni qabul qilish va check chiqarish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Patient List with Payment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bemorlar ro'yxati</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha bemorlar</SelectItem>
                <SelectItem value="pending">To'lanmagan</SelectItem>
                <SelectItem value="partial">Qisman to'langan</SelectItem>
                <SelectItem value="paid">To'langan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPatients.map((patient) => {
              const badge = getPaymentBadge(patient.paymentStatus);
              const Icon = badge.icon;

              return (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setPaymentStatus(patient.paymentStatus);
                    setPartialAmount(
                      patient.partialPaymentAmount?.toString() || ""
                    );
                    setSearchQuery("");
                  }}
                >
                  <div className="space-y-1">
                    <p>
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.department} •{" "}
                      {new Date(patient.registrationDate).toLocaleDateString(
                        "uz-UZ"
                      )}
                    </p>
                    {patient.labTestName && (
                      <p className="text-xs text-muted-foreground">
                        Tahlil: {patient.labTestName}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-medium">
                      {patient.paymentAmount?.toLocaleString()} so'm
                    </p>
                    <Badge className={badge.className}>
                      <Icon className="w-3 h-3 mr-1" />
                      {badge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>To'lov cheki</DialogTitle>
            <DialogDescription>Bemorning to'lov cheki</DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 print:p-8">
              <div className="text-center border-b pb-4">
                <h2>KLINIKA BOSHQARUV TIZIMI</h2>
                <p className="text-muted-foreground">To'lov cheki</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check ID:</span>
                  <span className="font-mono text-sm">
                    {receiptData.patientId}
                  </span>
                </div>
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
                  <span>
                    {new Date(receiptData.date).toLocaleString("uz-UZ")}
                  </span>
                </div>
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Umumiy to'lov:
                    </span>
                    <span>
                      {receiptData.totalAmount?.toLocaleString()} so'm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To'langan:</span>
                    <span className="text-green-600 font-medium">
                      {receiptData.paidAmount?.toLocaleString()} so'm
                    </span>
                  </div>
                  {receiptData.remainingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Qolgan:</span>
                      <span className="text-red-600 font-medium">
                        {receiptData.remainingAmount?.toLocaleString()} so'm
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Holat:</span>
                  <span
                    className={
                      receiptData.paymentStatus === "To'langan"
                        ? "text-green-600"
                        : receiptData.paymentStatus === "Qisman to'langan"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {receiptData.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <Button onClick={handlePrintReceipt} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Chop etish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReceipt(false)}
                  className="flex-1"
                >
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
