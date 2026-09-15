import { AuthLayout } from "@/components/auth-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Paumanhin, may naganap na mali.</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="text-sm text-muted-foreground">Error code: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">May naganap na hindi tiyak na error.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
