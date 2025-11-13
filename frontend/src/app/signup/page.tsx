import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          DropSpot&apos;a Katıl
        </h1>
        <p className="text-sm text-slate-400">
          Hesap oluştur ve sınırlı stoklu drop&apos;lara erkenden eriş.
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}

