import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-dark">Email verification</h1>
        <p className="text-mid">
          Please check your email for a verification link. Once verified, you can sign in to your account.
        </p>
        <Link href="/auth/signin" className="text-primary underline inline-block mt-4">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
