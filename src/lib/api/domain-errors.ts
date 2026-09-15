import type { ProblemOverrides } from "./responses";

export interface DomainErrorOptions {
  code?: string;
  title?: string;
  detail?: string;
  errors?: ProblemOverrides["errors"];
  cause?: unknown;
}

function resolve(
  defaults: { code: string; title: string; detail: string; status: number },
  options?: DomainErrorOptions,
): { code: string; title: string; detail: string; errors?: ProblemOverrides["errors"] } {
  return {
    code: options?.code ?? defaults.code,
    title: options?.title ?? defaults.title,
    detail: options?.detail ?? defaults.detail,
    ...(options?.errors !== undefined ? { errors: options.errors } : {}),
  };
}

export abstract class DomainError extends Error {
  abstract readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly errors?: ProblemOverrides["errors"];

  constructor(defaults: { code: string; title: string; detail: string; status: number }, options?: DomainErrorOptions) {
    super(options?.detail ?? defaults.detail, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    const resolved = resolve(defaults, options);
    this.code = resolved.code;
    this.title = resolved.title;
    this.detail = resolved.detail;
    if (resolved.errors !== undefined) this.errors = resolved.errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toOverrides(): ProblemOverrides {
    return {
      code: this.code,
      title: this.title,
      detail: this.detail,
      ...(this.errors !== undefined ? { errors: this.errors } : {}),
    };
  }
}

export class ValidationError extends DomainError {
  readonly status = 400;
  constructor(options?: DomainErrorOptions) {
    super({ code: "bad-request", title: "Maling Request", detail: "Hindi ko maintindihan ang request mo o may kulang na impormasyon.", status: 400 }, options);
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  constructor(options?: DomainErrorOptions) {
    super({ code: "unauthorized", title: "Kailangan Kitang Makilala Muna", detail: "Kailangan mo munang mag-sign in bago ko ito maproseso.", status: 401 }, options);
  }
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  constructor(options?: DomainErrorOptions) {
    super({ code: "forbidden", title: "Hindi Kita Mabibigyan ng Access", detail: "Hindi kita mabibigyan ng access sa hinihiling mong resource.", status: 403 }, options);
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  constructor(options?: DomainErrorOptions) {
    super({ code: "not-found", title: "Hindi Ko Mahanap", detail: "Hindi ko mahanap ang hinihiling mong resource.", status: 404 }, options);
  }
}

export class ConflictError extends DomainError {
  readonly status = 409;
  constructor(options?: DomainErrorOptions) {
    super({ code: "conflict", title: "May Salungatan Ako sa Request Mo", detail: "Salungat ang request mo sa kasalukuyan kong estado.", status: 409 }, options);
  }
}

export class UnprocessableError extends DomainError {
  readonly status = 422;
  constructor(options?: DomainErrorOptions) {
    super({ code: "unprocessable-entity", title: "Hindi Ko Maproseso", detail: "Naintindihan ko ang request mo, pero hindi ko ito maproseso.", status: 422 }, options);
  }
}

export class RateLimitedError extends DomainError {
  readonly status = 429;
  constructor(options?: DomainErrorOptions) {
    super({ code: "too-many-requests", title: "Sobra Na Akong Request", detail: "Sobra na akong nakakatanggap ng request. Subukan mo ulit mamaya.", status: 429 }, options);
  }
}

export class UpstreamError extends DomainError {
  readonly status = 502;
  constructor(options?: DomainErrorOptions) {
    super({ code: "bad-gateway", title: "Hindi Ako Nakatanggap ng Tugon", detail: "Hindi ako nakatanggap ng tugon mula sa upstream service ko.", status: 502 }, options);
  }
}

export class InternalError extends DomainError {
  readonly status = 500;
  constructor(options?: DomainErrorOptions) {
    super({ code: "internal-server-error", title: "May Error Sa Akin", detail: "May naganap na error sa akin. Paumanhin.", status: 500 }, options);
  }
}

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}
