import z from "zod";
import { fail, success, validation, type ActionResponse } from "@/lib/csap";

type ActionHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput> | TOutput;
type ValidationSchema<TInput> = z.ZodSchema<TInput>;

export function actionify<TInput, TOutput>(
  handler: ActionHandler<TInput, TOutput>,
  schema: ValidationSchema<TInput>,
) {
  return async function action(input: TInput): Promise<ActionResponse<TOutput>> {
    const parsed = validation(schema, input);
    if (parsed) {
      return parsed;
    }

    try {
      const data = await handler(input);
      return success(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN_FAILURE";
      return fail("handler_error", message);
    }
  };
}
