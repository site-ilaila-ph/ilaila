"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { readProblemMessage } from "@/lib/api/client";
import { safeNextPath } from "@/lib/safe-next-path";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import bg from "@/assets/login-form-bg.png";
import bg2 from "@/assets/login-form-bg-2.png";
import { Route } from "next";

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSwitch?: () => void;
}

export function LoginForm({ className, onSwitch, ...props }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Failed to sign in"));
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safeNextPath(next, "/home") as Route);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn("rounded-tr-none rounded-br-none border-r-0", className)}
      {...props}
    >
      <CardHeader className="inline-flex flex-col items-center">
        <CardTitle className="text-2xl">Mag Sign in</CardTitle>

        <CardDescription className="text-center">
          Ilagay ang iyong email sa ibaba upang makapag sign in
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleLogin}
          className="relative overflow-hidden bg-cover bg-center"
        >
          <div className="flex flex-col gap-6 bg-card text-foreground">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>

                <Link
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Nakalimutan ang password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Wala pang account?{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="underline underline-offset-4"
            >
              Mag Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function SignUpForm({ className, onSwitch, ...props }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Hindi magkatugma ang mga password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Hindi nagawa ang pag-sign up"));
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "May naganap na error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn("rounded-tl-none rounded-bl-none border-l-0", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-2xl">Mag Sign up</CardTitle>

        <CardDescription>Gumawa ng bagong account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-6 bg-card text-foreground">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="repeat-password">Ulitin ang Password</Label>

              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Gumagawa ng account..." : "Mag Sign up"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            May account ka na?{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="underline underline-offset-4"
            >
              Mag Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type AuthMode = "login" | "sign-up";

interface SignUpOrLoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultMode?: AuthMode;
}

export function SignUpOrLoginForm({
  className,
  defaultMode = "login",
  ...props
}: SignUpOrLoginFormProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const isLogin = mode === "login";
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as const;

  const FormComp = isLogin ? LoginForm : SignUpForm;

  const formCardPart = (
    <motion.div
      key={mode}
      layoutId="auth-form"
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 15 }}
      transition={{
        opacity: { duration: 0.2 },
        x: springTransition,
      }}
      className="w-full md:flex-1"
    >
      <FormComp
        onSwitch={() => setMode(isLogin ? "sign-up" : "login")}
        className="h-full"
      />
    </motion.div>
  );

  const artworkPart = (
    <motion.div
      key="artwork"
      layout
      transition={springTransition}
      className="w-full md:flex-1"
    >
      <motion.div
        layoutId="auth-image"
        transition={{
          opacity: { duration: 0.2 },
          x: springTransition,
        }}
        className={cn(
          "hidden h-full min-h-125 rounded-xl border md:block",
          isLogin ? "rounded-l-none" : "rounded-r-none",
        )}
        style={{
          backgroundImage: `url(${(isLogin ? bg : bg2).src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </motion.div>
  );

  const parts = isLogin
    ? [formCardPart, artworkPart]
    : [artworkPart, formCardPart];

  return (
    <div
      className={cn("flex w-full flex-col md:flex-row", className)}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {parts}
      </AnimatePresence>
    </div>
  );
}
