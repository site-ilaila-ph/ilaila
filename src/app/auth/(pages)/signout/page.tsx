import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";
import { Separator } from "@/lib/components/layout/separator";
import { Viewport } from "@/lib/components/layout/viewport";
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