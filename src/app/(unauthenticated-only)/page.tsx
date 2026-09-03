import { redirect } from "next/navigation";

export default function RootGuestPage() {
  redirect("/landing");
}