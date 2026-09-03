"use client";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";
import { ActionFormExtension } from "@/lib/components/form/action";
import { Form } from "@/lib/components/form/form";
import { Separator } from "@/lib/components/layout/separator";
import { Viewport } from "@/lib/components/layout/viewport";
import { HomeIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default function SignOut() {
    return (
        <Viewport className="flex flex-col justify-center items-center">
            <Form>
                <ActionFormExtension
                    action={signOutAction}
                    onSuccess={() => {
                        redirect("/landing");
                    }}
                />
                <Card>
                    <CardContent>
                        <span>Sign out of your account?</span>
                        <Separator />
                        <Button type="submit"><HomeIcon /> Sign out</Button>
                    </CardContent>
                </Card>
            </Form>
        </Viewport>
    );
}