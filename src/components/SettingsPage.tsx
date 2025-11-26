import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Settings, Bell, Shield, Database, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { clinicAboutService } from "../services/clinic-about.service";
import { useClinicSettings } from "../stores/clinic-settings.store";

export function SettingsPage() {
  const [clinicSettingsId, setClinicSettingsId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setClinicSettings: setClinicSettingsStore } = useClinicSettings();

  const [clinicSettings, setClinicSettings] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    work_time: "",
  });

  const [notifications, setNotifications] = useState({
    newPatient: true,
    labResults: true,
    consultationComplete: true,
    paymentReminder: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    autoLogout: true,
  });

  const [system, setSystem] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "365",
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchClinicSettings = async () => {
      setIsLoading(true);
      try {
        const data = await clinicAboutService.findAll();
        if (data && data.length > 0) {
          const settings = data[0];
          setClinicSettings({
            name: settings.name,
            address: settings.address,
            phone_number: settings.phone_number,
            email: settings.email,
            work_time: settings.work_time,
          });
          setClinicSettingsStore({
            name: settings.name,
            address: settings.address,
            phone_number: settings.phone_number,
            email: settings.email,
            work_time: settings.work_time,
          });
          setClinicSettingsId(settings.id);
        }
      } catch (error) {
        toast.error("Klinika ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClinicSettings();
  }, []);

  const handleSaveClinicSettings = async () => {
    setIsSubmitting(true);
    try {
      if (clinicSettingsId) {
        await clinicAboutService.update({
          id: clinicSettingsId,
          ...clinicSettings,
        });
      } else {
        await clinicAboutService.create(clinicSettings);
      }
      toast.success("Klinika sozlamalari saqlandi");
    } catch (error) {
      toast.error("Klinika sozlamalarini saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success("Bildirishnoma sozlamalari saqlandi");
  };

  const handleSaveSecurity = () => {
    toast.success("Xavfsizlik sozlamalari saqlandi");
  };

  const handleSaveSystem = () => {
    toast.success("Tizim sozlamalari saqlandi");
  };

  const handleBackup = () => {
    toast.success("Zaxira nusxa yaratilmoqda...");
    setTimeout(() => {
      toast.success("Zaxira nusxa muvaffaqiyatli yaratildi");
    }, 2000);
  };

  const handleRestore = () => {
    toast.info("Tiklash jarayoni boshlandi...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Sozlamalar</h1>
        <p className="text-muted-foreground">
          Tizim va klinika sozlamalarini boshqarish
        </p>
      </div>

      {/* Clinic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Settings className="w-5 h-5 inline mr-2" />
            Klinika ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Klinika nomi</Label>
                <Input
                  id="clinicName"
                  value={clinicSettings.name}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      name: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqami</Label>
                <Input
                  id="phone"
                  value={clinicSettings.phone_number}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      phone_number: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clinicSettings.email}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      email: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">Ish vaqti</Label>
                <Input
                  id="workingHours"
                  value={clinicSettings.work_time}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      work_time: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Manzil</Label>
                <Input
                  id="address"
                  value={clinicSettings.address}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      address: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveClinicSettings}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Saqlash
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="w-5 h-5 inline mr-2" />
            Bildirishnomalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Yangi bemor ro'yxatga olindi</p>
                <p className="text-sm text-muted-foreground">
                  Yangi bemor qo'shilganda bildirishnoma yuborish
                </p>
              </div>
              <Switch
                checked={notifications.newPatient}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newPatient: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Laboratoriya natijalari</p>
                <p className="text-sm text-muted-foreground">
                  Tahlil natijalari tayyor bo'lganda bildirishnoma
                </p>
              </div>
              <Switch
                checked={notifications.labResults}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, labResults: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Konsultatsiya tugallandi</p>
                <p className="text-sm text-muted-foreground">
                  Shifokor konsultatsiyasini tugatganda bildirishnoma
                </p>
              </div>
              <Switch
                checked={notifications.consultationComplete}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    consultationComplete: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>To'lov eslatmasi</p>
                <p className="text-sm text-muted-foreground">
                  To'lanmagan to'lovlar haqida eslatma
                </p>
              </div>
              <Switch
                checked={notifications.paymentReminder}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    paymentReminder: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Email bildirishnomalari</p>
                <p className="text-sm text-muted-foreground">
                  Email orqali bildirishnoma yuborish
                </p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    emailNotifications: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>SMS bildirishnomalari</p>
                <p className="text-sm text-muted-foreground">
                  SMS orqali bildirishnoma yuborish
                </p>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    smsNotifications: checked,
                  })
                }
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications}>Saqlash</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Shield className="w-5 h-5 inline mr-2" />
            Xavfsizlik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Ikki bosqichli autentifikatsiya</p>
                <p className="text-sm text-muted-foreground">
                  Kirishda qo'shimcha xavfsizlik
                </p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, twoFactorAuth: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Avtomatik chiqish</p>
                <p className="text-sm text-muted-foreground">
                  Faolsizlikda avtomatik tizimdan chiqish
                </p>
              </div>
              <Switch
                checked={security.autoLogout}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, autoLogout: checked })
                }
              />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Sessiya vaqti (daqiqa)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) =>
                    setSecurity({ ...security, sessionTimeout: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">
                  Parol amal qilish muddati (kun)
                </Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={security.passwordExpiry}
                  onChange={(e) =>
                    setSecurity({ ...security, passwordExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSecurity}>Saqlash</Button>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="w-5 h-5 inline mr-2" />
            Tizim sozlamalari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Avtomatik zaxira nusxa</p>
                <p className="text-sm text-muted-foreground">
                  Ma'lumotlarni avtomatik zaxiralash
                </p>
              </div>
              <Switch
                checked={system.autoBackup}
                onCheckedChange={(checked) =>
                  setSystem({ ...system, autoBackup: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Texnik xizmat rejimi</p>
                <p className="text-sm text-muted-foreground">
                  Tizimni vaqtincha to'xtatish
                </p>
              </div>
              <Switch
                checked={system.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSystem({ ...system, maintenanceMode: checked })
                }
              />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Zaxiralash chastotasi</Label>
                <select
                  id="backupFrequency"
                  value={system.backupFrequency}
                  onChange={(e) =>
                    setSystem({ ...system, backupFrequency: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="hourly">Har soat</option>
                  <option value="daily">Har kun</option>
                  <option value="weekly">Har hafta</option>
                  <option value="monthly">Har oy</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRetention">
                  Ma'lumotlarni saqlash (kun)
                </Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={system.dataRetention}
                  onChange={(e) =>
                    setSystem({ ...system, dataRetention: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button onClick={handleBackup} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Zaxira nusxa yaratish
              </Button>
              <Button onClick={handleRestore} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Tiklash
              </Button>
            </div>
          </div>

          <Button onClick={handleSaveSystem}>Saqlash</Button>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Globe className="w-5 h-5 inline mr-2" />
            Til va mintaqa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Til</Label>
              <select
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="uz">O'zbekcha</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Vaqt zonasi</Label>
              <select
                id="timezone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Asia/Tashkent">Toshkent (UTC+5)</option>
                <option value="Asia/Samarkand">Samarqand (UTC+5)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Sana formati</Label>
              <select
                id="dateFormat"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Valyuta</Label>
              <select
                id="currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="UZS">O'zbek so'mi (UZS)</option>
                <option value="USD">Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>

          <Button>Saqlash</Button>
        </CardContent>
      </Card>
    </div>
  );
}
