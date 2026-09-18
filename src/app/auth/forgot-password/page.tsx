import { AuthLayout } from "@/presentation/auth-layout";
import { ForgotPasswordForm } from "@/presentation/forgot-password-form";

export default function Page() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
