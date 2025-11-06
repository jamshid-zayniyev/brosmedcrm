import { useState } from 'react';
import { AppContextType } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsPageProps {
  context: AppContextType;
}

export function SettingsPage({ context }: SettingsPageProps) {
  const [clinicSettings, setClinicSettings] = useState({
    clinicName: 'Klinika Boshqaruv Tizimi',
    address: 'Toshkent shahar, Yunusobod tumani',
    phone: '+998 71 123 45 67',
    email: 'info@klinika.uz',
    workingHours: '08:00 - 18:00',
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
    sessionTimeout: '30',
    passwordExpiry: '90',
    autoLogout: true,
  });

  const [system, setSystem] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365',
    maintenanceMode: false,
  });

  const handleSaveClinicSettings = () => {
    toast.success('Klinika sozlamalari saqlandi');
  };

  const handleSaveNotifications = () => {
    toast.success('Bildirishnoma sozlamalari saqlandi');
  };

  const handleSaveSecurity = () => {
    toast.success('Xavfsizlik sozlamalari saqlandi');
  };

  const handleSaveSystem = () => {
    toast.success('Tizim sozlamalari saqlandi');
  };

  const handleBackup = () => {
    toast.success('Zaxira nusxa yaratilmoqda...');
    setTimeout(() => {
      toast.success('Zaxira nusxa muvaffaqiyatli yaratildi');
    }, 2000);
  };

  const handleRestore = () => {
    toast.info('Tiklash jarayoni boshlandi...');
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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Klinika nomi</Label>
              <Input
                id="clinicName"
                value={clinicSettings.clinicName}
                onChange={(e) => setClinicSettings({ ...clinicSettings, clinicName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqami</Label>
              <Input
                id="phone"
                value={clinicSettings.phone}
                onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clinicSettings.email}
                onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Ish vaqti</Label>
              <Input
                id="workingHours"
                value={clinicSettings.workingHours}
                onChange={(e) => setClinicSettings({ ...clinicSettings, workingHours: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Manzil</Label>
              <Input
                id="address"
                value={clinicSettings.address}
                onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSaveClinicSettings}>
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, newPatient: checked })}
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, labResults: checked })}
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, consultationComplete: checked })}
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminder: checked })}
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
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
                onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications}>
            Saqlash
          </Button>
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
                onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
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
                onCheckedChange={(checked) => setSecurity({ ...security, autoLogout: checked })}
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
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Parol amal qilish muddati (kun)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={security.passwordExpiry}
                  onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSecurity}>
            Saqlash
          </Button>
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
                onCheckedChange={(checked) => setSystem({ ...system, autoBackup: checked })}
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
                onCheckedChange={(checked) => setSystem({ ...system, maintenanceMode: checked })}
              />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Zaxiralash chastotasi</Label>
                <select
                  id="backupFrequency"
                  value={system.backupFrequency}
                  onChange={(e) => setSystem({ ...system, backupFrequency: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="hourly">Har soat</option>
                  <option value="daily">Har kun</option>
                  <option value="weekly">Har hafta</option>
                  <option value="monthly">Har oy</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRetention">Ma'lumotlarni saqlash (kun)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={system.dataRetention}
                  onChange={(e) => setSystem({ ...system, dataRetention: e.target.value })}
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

          <Button onClick={handleSaveSystem}>
            Saqlash
          </Button>
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

          <Button>
            Saqlash
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
