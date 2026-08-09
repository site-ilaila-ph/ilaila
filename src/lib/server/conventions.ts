import './server-only';

type AnyApplicationFunctionParams = Record<string, unknown>;
interface ApplicationFunction<TParams extends AnyApplicationFunctionParams = AnyApplicationFunctionParams, TReturn = unknown> {
    (params: TParams): TReturn;
}

export type { ApplicationFunction }