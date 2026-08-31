// Admin panel removed — was powered by Supabase Edge Functions (GSC admin).
// Kept as a placeholder for self-hosters who want to implement their own admin.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Admin() {
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Admin panel is not available in this open-source build.
            It required a Supabase Edge Function (gsc-admin) which has been removed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}