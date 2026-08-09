import { Button } from "@/lib/client/components/actions/button";
import { Card, CardContent } from "@/lib/client/components/display/card";
import { Separator } from "@/lib/client/components/layout/separator";
import { Viewport } from "@/lib/client/components/layout/viewport";
import { HomeIcon } from "lucide-react";

export default function SignOut() {
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