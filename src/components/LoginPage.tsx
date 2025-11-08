import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Activity, User, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = onLogin(username, password);
    if (!success) {
      setError("Noto'g'ri foydalanuvchi nomi yoki parol");
    }
  };

  const quickLogin = (user: string) => {
    setUsername(user);
    setPassword("password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Klinika Boshqaruv Tizimi</CardTitle>
          <CardDescription>
            Tizimga kirish uchun foydalanuvchi nomi va parolni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Foydalanuvchi nomi</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Foydalanuvchi nomini kiriting"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Kirish
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Tezkor kirish (demo)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin("admin")}
                className="text-xs"
              >
                Superadmin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin("reception")}
                className="text-xs"
              >
                Qabul
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin("lab")}
                className="text-xs"
              >
                Laboratoriya
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin("doctor")}
                className="text-xs"
              >
                Shifokor
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo: Barcha hisoblar uchun parol -{" "}
              <code className="bg-muted px-1 py-0.5 rounded">password</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
