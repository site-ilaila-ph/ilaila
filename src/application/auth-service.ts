import { injectable } from "inversify";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

@injectable()
export class AuthService {
  async getCurrentAuthUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // safe to ignore in server component
            }
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  requireAuthId(authId: string | null | undefined): string {
    if (!authId) {
      throw new Error("Authentication required");
    }
    return authId;
  }
}
