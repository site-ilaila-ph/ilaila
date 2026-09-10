export function createSessionReader({ db, cache, cookieMap }: any) {
  return {
    async getSessionId() {
      return null;
    },
    async getSessionUser() {
      return {
        id: "00000000-0000-0000-0000-000000000000",
        email: "anonymous@example.com",
        isAdmin: false,
      };
    },
  };
}
