import { getSessionId } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function RootPage() {
  if (await getSessionId()) {
    redirect("/home")
  } else {
    redirect("/landing")
  }
}
