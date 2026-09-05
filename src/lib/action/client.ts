"use client";

import { useCallback, useState, useTransition } from "react";
import type { AnyFunctionCoercedServerAction } from "./server";

interface UseServerActionOptions<TAction extends AnyFunctionCoercedServerAction> {
    action: TAction;
}

interface UseServerActionReturn<TAction extends AnyFunctionCoercedServerAction> {
    execute(params: Parameters<TAction>[0]): Promise<Awaited<ReturnType<TAction>>>;
    executionOngoing: boolean;
    result: Awaited<ReturnType<TAction>> | null;
}

function useServerAction<TAction extends AnyFunctionCoercedServerAction>({ action }: UseServerActionOptions<TAction>): UseServerActionReturn<TAction> {
    type ResultType = UseServerActionReturn<TAction>['result'];
    const [executionOngoing, startExecution] = useTransition();
    const [result, setResult] = useState<ResultType>(null);

    const execute = useCallback((input: Parameters<TAction>[0]) => {
        return new Promise<Awaited<ReturnType<TAction>>>((resolve) => startExecution(async () => {
            const result = await action(input);
            setResult(result as ResultType);
            resolve(result as Awaited<ReturnType<TAction>>);
        }));
    }, [action]);

    return { executionOngoing, result, execute }
}

export { useServerAction };
