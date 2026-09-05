export default function assertServerOnly(message: string) {
    if (typeof window !== "undefined") {
        throw new Error(message);
    }
}