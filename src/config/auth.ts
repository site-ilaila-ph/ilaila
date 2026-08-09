export const SESSION_TOKEN_COOKIE_NAME = "SESSION_TOKEN";
export const REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS = "/landing";
export const REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS = "/home";

// Hashing Algorithm Configuration.
export const W = 7;
export const N = Math.pow(2, W);
export const r = 8;
export const p = 1;
export const K = 64;