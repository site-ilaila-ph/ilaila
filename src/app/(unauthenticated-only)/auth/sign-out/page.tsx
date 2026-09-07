"use client";

import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";
import { Separator } from "@/lib/components/layout/separator";
import { Viewport } from "@/lib/components/layout/viewport";
import { HomeIcon } from "lucide-react";

export default function SignOut() {
    return (
        <Viewport className="overflow-y-auto bg-linear-to-br from-primary/10 via-background to-secondary">
            <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
                <div className="mb-8 flex flex-col items-center text-center" aria-label="Ilaila">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-md" aria-hidden="true">I</span>
                    <span className="mt-3 font-heading text-2xl font-semibold tracking-tight text-primary">Ilaila</span>
                    <p className="mt-2 text-sm text-muted-foreground">Pagkain. Kuwento. Komunidad.</p>
                </div>

                <Card className="justify-center rounded-3xl border border-border bg-card py-10 shadow-lg ring-0 sm:py-12">
                        <CardContent className="flex flex-col items-center px-6 text-center sm:px-12">
                            <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary" aria-hidden="true">✓</span>
                            <p className="mt-6 font-heading text-2xl font-semibold tracking-tight">Matagumpay kang nag-sign out!</p>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Naka-log out na ang iyong account. Maaari kang bumalik anumang oras.</p>
                            <Separator className="my-8" />
                            <Button className="w-full sm:w-auto"><HomeIcon /> Pumunta sa home</Button>
                        </CardContent>
                    </Card>
            </div>
        </Viewport>
    )
}