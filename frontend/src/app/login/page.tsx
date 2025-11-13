import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Giriş Yap</h1>
        <p className="text-sm text-slate-400">
          DropSpot hesabınla giriş yaparak bekleme listesi ve claim haklarını
          yönetebilirsin.
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}

