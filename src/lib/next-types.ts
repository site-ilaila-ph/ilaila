import { NextRequest } from "next/server";

type RequestHandler<TParams extends [request: NextRequest, ctx: unknown]> = (
  ...params: TParams
) => Promise<Response>;
type AnyRequestHandler = RequestHandler<[NextRequest, unknown]>
export type { RequestHandler, AnyRequestHandler }