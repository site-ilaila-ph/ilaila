import { after } from "next/server";

export default function defer({ fn }: { fn: () => void | Promise<void> }): void {
  after(() => fn());
}