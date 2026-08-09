export interface ServerErrorOptions {
  domain: string; // What feature threw the error (e.g., 'auth', 'billing')
  hint?: string;  // Identifier for the specific error variant
  message: string; // The full error message
  sensitive?: boolean; // Defaults to true for safety
}

export class ServerError extends Error {
  public readonly domain: string;
  public readonly hint?: string;
  public readonly sensitive: boolean;

  public constructor({
    domain,
    hint,
    message,
    sensitive = true,
  }: ServerErrorOptions) {
    super(message);

    this.name = 'ServerError';
    this.domain = domain;
    this.hint = hint;
    this.sensitive = sensitive;

    Object.setPrototypeOf(this, ServerError.prototype);
  }
}