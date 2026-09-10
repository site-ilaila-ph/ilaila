export function mapKnownApiRouteFailure(error: unknown, fallback = "Unknown error") {
  const message = error instanceof Error ? error.message : fallback;
  return {
    status: 500,
    message,
  };
}
