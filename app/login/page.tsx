"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { BrandLogo, BrandName } from "@/src/components/ui/brand";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-zinc-900 to-black">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <Card className="w-full max-w-md relative z-10 border-zinc-800 bg-zinc-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/50 shadow-2xl shadow-black/50">
        <CardHeader className="space-y-4 pb-6 flex flex-col items-center">
          <BrandLogo size="xl" className="shadow-2xl" />
          <div className="text-center space-y-1">
            <BrandName size="xl" className="text-white" />
            <div className="text-blue-500 font-medium tracking-widest text-xs uppercase opacity-80">
              Premium Automotive System
            </div>
          </div>
          <CardDescription className="text-center text-zinc-400 text-base mt-2">
            Bienvenue dans votre cockpit de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email professionnel
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@gmail.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01]"
              disabled={loading}
            >
              {loading ? "Démarrage du moteur..." : "Démarrer la session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
