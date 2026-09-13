import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, type AuthSession } from "@/services/auth";
import interiorImage from "@/assets/property-interior.jpg";

export function LoginForm({ onSuccess }: { onSuccess: (session: AuthSession) => void }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); setLoading(true); try { onSuccess(await authService.signIn(username, password)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in."); } finally { setLoading(false); } }
  return <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-primary lg:block"><img src={interiorImage} width={1200} height={800} alt="Sunlit contemporary home interior" className="h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-primary/45" /><div className="absolute inset-x-12 bottom-14 max-w-xl text-primary-foreground"><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em]">Curated homes · Chennai</p><p className="font-display text-5xl leading-tight">Spaces made for the life you’re building.</p></div></section>
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12"><div className="w-full max-w-md"><Brand /><div className="mt-14"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Welcome home</p><h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">Find a place you’ll love.</h1><p className="mt-4 max-w-sm leading-7 text-muted-foreground">Sign in to explore verified properties across Chennai, thoughtfully gathered in one place.</p></div>
      <form className="mt-10 space-y-5" onSubmit={submit}><div className="space-y-2"><Label htmlFor="username">Username</Label><Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="h-12 bg-card px-4" /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 bg-card px-4" /></div>{error && <p role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}<Button type="submit" size="lg" disabled={loading} className="h-12 w-full text-sm">{loading ? <><LoaderCircle className="animate-spin" />Signing in…</> : <>Sign in<ArrowRight /></>}</Button><p className="text-center text-xs text-muted-foreground">Use any username and a password of at least 4 characters.</p></form>
    </div></section></main>;
}
