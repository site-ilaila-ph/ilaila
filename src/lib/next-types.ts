import { NextRequest, NextResponse } from "next/server";

type RequestHandler<TParams extends [request: NextRequest, ctx: unknown]> = (
  ...params: TParams
) => Promise<NextResponse>;
type AnyRequestHandler = RequestHandler<[NextRequest, unknown]>
export type { RequestHandler, AnyRequestHandler }