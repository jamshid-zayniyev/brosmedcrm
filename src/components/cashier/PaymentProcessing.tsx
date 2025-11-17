import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";
import { patientService } from "../../services/patient.service";
import { Patient as ApiPatient } from "../../interfaces/patient.interface";
import { User } from "../../interfaces/user.interface";
import { DepartmentType } from "../../interfaces/department-type.interface";
import { Skeleton } from "../ui/skeleton";

// Create a local extended User type to include the price field described by the user
type ExtendedUser = User & {
  price?: string;
};

// The Patient type used within this component, with calculated fields
type Patient = Omit<ApiPatient, "user"> & {
  user?: ExtendedUser;
  paymentAmount?: number;
  partialPaymentAmount?: number; // This is a local calculation field
};

export function PaymentProcessing() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.findAll();
      const processedData = data.map((patient: ApiPatient) => {
        // Safely cast user to ExtendedUser to check for price
        const extendedUser = patient.user as ExtendedUser | undefined;

        const priceString =
          patient.department_types?.price || extendedUser?.price || "0";
        const paymentAmount = parseFloat(priceString);

        return {
          ...patient,
          paymentAmount,
        };
      });
      setAllPatients(processedData);
    } catch (error) {
      toast.error("Bemorlarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"p" | "c" | "pc">("p");
  const [partialAmount, setPartialAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "p" | "c" | "pc">(
    "all"
  );

  useEffect(() => {
    let patients = allPatients;
    if (filterStatus !== "all") {
      patients = allPatients.filter((p) => p.payment_status === filterStatus);
    }
    setFilteredPatients(patients);
  }, [filterStatus, allPatients]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.info("Qidirish uchun ma'lumot kiriting");
      return;
    }
    const found = allPatients.find(
      (p) =>
        p.phone_number.includes(searchQuery) ||
        `${p.name} ${p.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.id.toString() === searchQuery
    );

    if (found) {
      setSelectedPatient(found);
      setPaymentStatus(found.payment_status);
      // Assuming partialPaymentAmount is not coming from API, so we don't set it here
      setPartialAmount("");
      toast.success("Bemor topildi!");
    } else {
      toast.error("Bemor topilmadi");
      setSelectedPatient(null);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedPatient) {
      toast.error("Bemorni tanlang");
      return;
    }
    setProcessingPayment(true);

    let updatedPartialAmount = 0;

    if (paymentStatus === "pc") {
      const amount = parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        toast.error("To'lov miqdorini kiriting");
        setProcessingPayment(false);
        return;
      }
      if (amount >= (selectedPatient.paymentAmount || 0)) {
        toast.error("Qisman to'lov to'liq miqdordan kam bo'lishi kerak");
        setProcessingPayment(false);
        return;
      }
      updatedPartialAmount = amount;
    }

    try {
      await patientService.update({
        id: selectedPatient.id,
        payment_status: paymentStatus,
        // partial_amount could be sent here if API supports it
      });

      // Prepare receipt
      const receipt = {
        patientName: `${selectedPatient.name} ${selectedPatient.last_name}`,
        patientId: selectedPatient.id,
        department: selectedPatient.department_types?.title || "Noma'lum bo'lim",
        service: selectedPatient.user?.full_name
          ? `${selectedPatient.user.full_name} ko'rigi`
          : "Umumiy xizmat",
        totalAmount: selectedPatient.paymentAmount,
        paidAmount:
          paymentStatus === "c"
            ? selectedPatient.paymentAmount
            : updatedPartialAmount,
        remainingAmount:
          paymentStatus === "pc"
            ? (selectedPatient.paymentAmount || 0) - updatedPartialAmount
            : 0,
        paymentStatus:
          paymentStatus === "c"
            ? "To'langan"
            : paymentStatus === "pc"
            ? "Qisman to'langan"
            : "Kutilmoqda",
        date: new Date().toISOString(),
      };

      setReceiptData(receipt);
      setShowReceipt(true);
      toast.success("To'lov muvaffaqiyatli amalga oshirildi!");

      // Reset and refetch
      setSelectedPatient(null);
      setSearchQuery("");
      setPaymentStatus("p");
      setPartialAmount("");
      fetchPatients();
    } catch (error) {
      toast.error("To'lovni yangilashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getPaymentBadge = (status: "p" | "c" | "pc") => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      p: {
        label: "Kutilmoqda",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: AlertCircle,
      },
      pc: {
        label: "Qisman",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: Clock,
      },
c: {
        label: "To'langan",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: Check,
      },
    };
    return statusConfig[status] || statusConfig["p"];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>To'lov qabul qilish</h1>
        <p className="text-muted-foreground">
          Bemorlardan to'lov qabul qiling va check chiqaring
        </p>
      </div>

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

      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>
              <DollarSign className="w-5 h-5 inline mr-2" />
              To'lov qabul qilish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bemor:</span>
                <span>
                  {selectedPatient.name} {selectedPatient.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{selectedPatient.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bo'lim:</span>
                <span>
                  {selectedPatient.department_types?.title || "Noma'lum"}
                </span>
              </div>
              {selectedPatient.user && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shifokor:</span>
                  <span>{selectedPatient.user.full_name}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Umumiy to'lov:</span>
                <span className="font-medium">
                  {selectedPatient.paymentAmount?.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joriy holat:</span>
                <Badge
                  className={
                    getPaymentBadge(selectedPatient.payment_status).className
                  }
                >
                  {getPaymentBadge(selectedPatient.payment_status).label}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To'lov holati *</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(value: "p" | "c" | "pc") =>
                    setPaymentStatus(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c">To'liq to'landi</SelectItem>
                    <SelectItem value="pc">Qisman to'landi</SelectItem>
                    <SelectItem value="p">To'lanmadi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentStatus === "pc" && (
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

              {paymentStatus === "c" && (
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

            <Button
              onClick={handleProcessPayment}
              className="w-full"
              disabled={processingPayment}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  To'lovni qabul qilish va check chiqarish
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bemorlar ro'yxati</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus as any}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha bemorlar</SelectItem>
                <SelectItem value="p">To'lanmagan</SelectItem>
                <SelectItem value="pc">Qisman to'langan</SelectItem>
                <SelectItem value="c">To'langan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-24 ml-auto" />
                    <Skeleton className="h-6 w-28 ml-auto" />
                  </div>
                </div>
              ))
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Bemorlar topilmadi
              </p>
            ) : (
              filteredPatients.map((patient) => {
                const badge = getPaymentBadge(patient.payment_status);
                const Icon = badge.icon;

                return (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPaymentStatus(patient.payment_status);
                      setPartialAmount("");
                      setSearchQuery("");
                    }}
                  >
                    <div className="space-y-1">
                      <p>
                        {patient.name} {patient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.department_types?.title || "Noma'lum"} •{" "}
                        {new Date(patient.created_at).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </p>
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
              })
            )}
          </div>
        </CardContent>
      </Card>

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
