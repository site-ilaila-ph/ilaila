import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/csap";
export async function signIn(email: string, password: string) {

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail(`AUTH_ERROR:${error.code}`);

  return (null);
}

export async function signUp(
  email: string,
  password: string,
) {

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { },
  });

  if (error) return fail(`AUTH_ERROR:${error.code}`);

  return success(null);
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return fail(`AUTH_ERROR:${error.code}`);

  return success(null);
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {});
  if (error) return fail(`AUTH_ERROR:${error.code}`);
  return success(null);
}

export async function updatePasswordService(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(`AUTH_ERROR:${error.code}`);
  return success(null);
}
