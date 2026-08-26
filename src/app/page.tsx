import { getSessionId } from "@/app/auth/services/session";
import { redirect } from "next/navigation";

export default async function RootPage() {
  if (await getSessionId()) {
    redirect("/home")
  } else {
    redirect("/landing")
  }
}
