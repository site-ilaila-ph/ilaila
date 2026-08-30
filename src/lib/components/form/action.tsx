"use client";

import { useEffect } from "react";
import type {
  AnyFunctionCoercedServerAction,
  InferFunctionCoercedServerActionResultData,
} from "@/lib/action";
import { useServerAction } from "@/lib/action";
import { useFormExtensionApi } from "@/lib/components/form/form";
import type { ActionFailure } from "@/lib/common-server-action-protocol";

interface ActionFormSuccessCallback<
  TAction extends AnyFunctionCoercedServerAction,
> {
  (data: InferFunctionCoercedServerActionResultData<TAction>): Promise<void> | void;
}

interface ActionFormFailureCallback {
  (failureResult: ActionFailure): Promise<void> | void;
}

export interface ActionFormExtensionProps<
  TAction extends AnyFunctionCoercedServerAction,
> {
  action: TAction;
  onSuccess?: ActionFormSuccessCallback<TAction>;
  onFailure?: ActionFormFailureCallback;
}

export function ActionFormExtension<
  TAction extends AnyFunctionCoercedServerAction,
>({
  action,
  onSuccess,
  onFailure,
}: ActionFormExtensionProps<TAction>) {
  const { registerSubmitInterceptor } = useFormExtensionApi();
  const { execute } = useServerAction({ action });

  useEffect(() => {
    const unregister = registerSubmitInterceptor(async (data, methods) => {
      const result = await execute(data as Parameters<TAction>[0]);

      if (result.success) {
        await onSuccess?.(result.data);
        return;
      }

      if (result.type === "validation" || result.type === "constraint") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            methods.setError(field as any, { type: "server", message });
          }
        }
      }

      if (result.type === "constraint" && result.globalErrors.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        methods.setError("root" as any, {
          type: "server",
          message: result.globalErrors[0],
        });
      }

      await onFailure?.(result);

      return { halt: true };
    });

    return unregister;
  }, [execute, onFailure, onSuccess, registerSubmitInterceptor]);

  return null;
}