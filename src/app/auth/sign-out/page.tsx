"use client";

import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";
import { Separator } from "@/lib/components/layout/separator";
import { Viewport } from "@/lib/components/layout/viewport";
import { HomeIcon } from "lucide-react";


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";

export default function SignOut() {
    const router = useRouter();

    useEffect(() => {
        void signOutAction({}).then(() => router.replace("/landing"));
    }, [router]);

    return (
        <Viewport className="flex flex-col justify-center items-center">
            <Card>
                <CardContent>
                    <span>You have been successfully signed out!</span>
                    <Separator />
                    <Button><HomeIcon /> Go to Home</Button>
                </CardContent>
            </Card>
        </Viewport>
    )
}