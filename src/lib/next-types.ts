import { NextRequest, NextResponse } from "next/server";

type RequestHandler<TParams extends [request: NextRequest, ctx: unknown]> = (
  ...params: TParams
) => Promise<NextResponse>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequestHandler = RequestHandler<[NextRequest, any]>
export type { RequestHandler, AnyRequestHandler }