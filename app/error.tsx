"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Home, ArrowLeft, RefreshCw, AlertOctagon } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Log the error for debugging
    console.error("Application error:", error);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, error]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertOctagon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Une erreur est survenue</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Désolé, quelque chose s'est mal passé. Veuillez réessayer.
          </p>

          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Code: {error.digest}
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
            <Button variant="outline" onClick={() => reset()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
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
