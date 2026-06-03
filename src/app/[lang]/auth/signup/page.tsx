import { SignUpForm } from "@/features/auth";

export default function SignUpPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark">Create your account</h1>
          <p className="text-mid mt-2">Join LocaleRent to book or list properties.</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
