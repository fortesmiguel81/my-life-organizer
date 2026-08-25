"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeRedirectPath } from "@/lib/safe-redirect";

export default function SiteLoginPage() {
  return (
    <Suspense>
      <SiteLoginContent />
    </Suspense>
  );
}

function SiteLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirectPath(
    searchParams.get("redirect_url"),
    "/select-profile"
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/site-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Incorrect password.");
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo.svg" alt="Life Organizer" width={64} height={64} />
        <h1 className="text-2xl font-bold">Life Organizer</h1>
        <p className="text-muted-foreground">
          Enter the household password to continue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={!password || isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  );
}
