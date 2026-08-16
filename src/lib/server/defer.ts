import { after } from "next/server";

interface DeferFnOptions {
    fn: () => unknown | Promise<unknown>;
}

function defer({ fn }: DeferFnOptions) {
    after(() => fn());
}

export { defer }
export type { DeferFnOptions }