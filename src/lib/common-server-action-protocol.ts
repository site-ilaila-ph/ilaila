// Common Server Action Protocol.

type ActionSuccess<TData> = {
  success: true;
  data: TData;
};

type ActionValidationErrors = Record<string, string[] | undefined>;

type ValidationActionFailure = {
  success: false;
  type: "validation";
  fieldErrors: ActionValidationErrors;
};

type ConstraintActionFailure = {
  success: false;
  type: "constraint";
  fieldErrors: ActionValidationErrors;
  globalErrors: string[];
};

type SensitiveActionFailure = {
  success: false;
  type: "sensitive";
  hint?: string;
};

type InsensitiveActionFailure = {
  success: false;
  type: "insensitive";
  hint?: string;
  message?: string;
};

type ActionFailure =
  | ValidationActionFailure
  | ConstraintActionFailure
  | SensitiveActionFailure
  | InsensitiveActionFailure;

type ActionResponse<TData> = ActionSuccess<TData> | ActionFailure;

export type {
    ActionSuccess,
    ActionValidationErrors,
    ValidationActionFailure,
    ConstraintActionFailure,
    SensitiveActionFailure,
    InsensitiveActionFailure,
    ActionFailure,
    ActionResponse
}