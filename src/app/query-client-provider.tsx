"use client";

import { QueryClient, QueryClientProvider as ActualQueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ActualQueryClientProvider client={queryClient}>
            {children}
        </ActualQueryClientProvider>
    );
}