function usePlaceholder<T>(value: T) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("usePlaceholder() called in production, please replace the placeholder with actual implementation.");
    }
    return value;
}

export default usePlaceholder;