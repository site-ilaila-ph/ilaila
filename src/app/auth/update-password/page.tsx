import { AuthLayout } from "@/presentation/auth-layout";
import { UpdatePasswordForm } from "@/presentation/update-password-form";

export default function Page() {
  return (
    <AuthLayout>
      <UpdatePasswordForm />
    </AuthLayout>
  );
}
