import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Send, CheckCircle2, XCircle, Lock } from "lucide-react";

type StatusResp = {
  site: string;
  verification: { status: number; ok: boolean; body: any };
  sites: { status: number; ok: boolean; body: any };
  sitemap: { status: number; ok: boolean; body: any };
  analytics: { status: number; ok: boolean; body: any };
  metaTag?: { ok: boolean; status?: number; found?: boolean; token?: string | null; expected?: string; matches?: boolean; error?: string };
};

const PWD_KEY = "gsc_admin_pwd";

export default function Admin() {
  const [pwd, setPwd] = useState<string>(() => sessionStorage.getItem(PWD_KEY) || "");
  const [authed, setAuthed] = useState<boolean>(!!sessionStorage.getItem(PWD_KEY));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<StatusResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async (action: "status" | "submit-sitemap", method: "GET" | "POST" = "GET") => {
    const { data, error } = await supabase.functions.invoke(`gsc-admin?action=${action}`, {
      method,
      headers: { "x-admin-password": pwd },
    });
    if (error) throw error;
    return data;
  };

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await call("status");
      if (res?.error) throw new Error(res.error);
      setData(res);
      sessionStorage.setItem(PWD_KEY, pwd);
      setAuthed(true);
    } catch (e: any) {
      const msg = e?.message || "Failed to load";
      setError(msg);
      if (/unauthorized|401/i.test(msg)) {
        sessionStorage.removeItem(PWD_KEY);
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitSitemap = async () => {
    setSubmitting(true);
    try {
      const res = await call("submit-sitemap", "POST");
      if (res?.submitted) {
        toast.success("Sitemap berhasil disubmit ke Google");
      } else {
        toast.error(`Gagal submit: ${res?.status} ${JSON.stringify(res?.body)?.slice(0, 120)}`);
      }
      await loadStatus();
    } catch (e: any) {
      toast.error(e?.message || "Gagal submit sitemap");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (authed) loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Admin password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadStatus()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={loadStatus} disabled={!pwd || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verified = data?.verification?.ok;
  const sitemap = data?.sitemap?.body as any;
  const sitemapOk = data?.sitemap?.ok;
  const sitesList = (data?.sites?.body as any)?.siteEntry || [];
  const analytics = (data?.analytics?.body as any)?.rows || [];
  const totalClicks = analytics.reduce((s: number, r: any) => s + (r.clicks || 0), 0);
  const totalImpr = analytics.reduce((s: number, r: any) => s + (r.impressions || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO Admin</h1>
            <p className="text-sm text-muted-foreground">{data?.site}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={submitSitemap} disabled={submitting || !verified}>
              {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Submit Sitemap
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {verified ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
                Verifikasi Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Badge variant={verified ? "default" : "destructive"}>
                {verified ? "Verified" : `Not verified (${data?.verification?.status})`}
              </Badge>
              {verified && (data?.verification?.body as any)?.owners && (
                <p className="text-muted-foreground">Owner: {(data?.verification?.body as any).owners.join(", ")}</p>
              )}
              <p className="text-muted-foreground">
                Terdaftar di GSC: {sitesList.find((s: any) => s.siteUrl === data?.site) ? "Ya" : "Tidak"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {data?.metaTag?.matches ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
                Meta Tag di HTML Live
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {data?.metaTag?.error ? (
                <p className="text-destructive">Gagal fetch: {data.metaTag.error}</p>
              ) : (
                <>
                  <Badge variant={data?.metaTag?.matches ? "default" : "destructive"}>
                    {data?.metaTag?.matches
                      ? "Token cocok"
                      : data?.metaTag?.found
                      ? "Ditemukan tapi token berbeda"
                      : "Tidak ditemukan"}
                  </Badge>
                  <p className="text-muted-foreground break-all">
                    HTTP {data?.metaTag?.status} · token: <code className="text-xs">{data?.metaTag?.token || "—"}</code>
                  </p>
                  {!data?.metaTag?.matches && data?.metaTag?.expected && (
                    <p className="text-muted-foreground break-all">
                      Expected: <code className="text-xs">{data.metaTag.expected}</code>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {sitemapOk ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
                Sitemap
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Badge variant={sitemapOk ? "default" : "destructive"}>
                {sitemapOk ? "Terdaftar" : `Belum (${data?.sitemap?.status})`}
              </Badge>
              {sitemapOk && (
                <div className="text-muted-foreground space-y-1">
                  <p>Last submitted: {sitemap?.lastSubmitted ? new Date(sitemap.lastSubmitted).toLocaleString("id-ID") : "—"}</p>
                  <p>Last downloaded: {sitemap?.lastDownloaded ? new Date(sitemap.lastDownloaded).toLocaleString("id-ID") : "—"}</p>
                  <p>URLs ditemukan: {sitemap?.contents?.[0]?.submitted ?? "—"} | diindeks: {sitemap?.contents?.[0]?.indexed ?? "—"}</p>
                  {sitemap?.errors > 0 && <p className="text-destructive">Errors: {sitemap.errors}</p>}
                  {sitemap?.warnings > 0 && <p className="text-amber-600">Warnings: {sitemap.warnings}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Performa 28 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {analytics.length === 0 ? (
                <p className="text-muted-foreground">Belum ada data impresi/klik dari Google (biasanya muncul beberapa hari setelah indexing).</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Total Klik</p>
                    <p className="text-2xl font-bold">{totalClicks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Impresi</p>
                    <p className="text-2xl font-bold">{totalImpr}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Klik <strong>Submit Sitemap</strong> setiap kali konten sitemap berubah agar Google segera re-crawl.
        </p>
      </div>
    </div>
  );
}