"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Home, ArrowLeft, ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirection automatique vers l'accueil
          if (status === "authenticated") {
            router.push("/");
          } else {
            router.push("/login");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, status]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    if (status === "authenticated") {
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Accès non autorisé</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
          </p>

          {status === "authenticated" && session?.user && (
            <p className="text-sm text-muted-foreground">
              Connecté en tant que{" "}
              <span className="font-medium">{session.user.name}</span>
              {session.user.role === "USER" && " (Utilisateur)"}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Redirection automatique dans{" "}
            <span className="font-bold">{countdown}</span> seconde
            {countdown > 1 ? "s" : ""}...
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
