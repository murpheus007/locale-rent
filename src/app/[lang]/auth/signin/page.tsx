import { SignInForm } from "@/features/auth";

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark">Sign in to LocaleRent</h1>
          <p className="text-mid mt-2">Welcome back. Sign in to your account.</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
