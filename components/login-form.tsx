"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // depending on your Supabase settings, user might need to confirm their email
      }

      router.push("/thoughts");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#1E261C] border-[#2c3829] rounded-4xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center text-white">
            {mode === "login"
              ? "Your private space awaits."
              : "Start saving and revisiting your thoughts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-white">
                  Email Address
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-full bg-[#152111] border-[#41533c] text-white placeholder:text-gray-500 focus:border-[#49e619] focus:ring-[#49e619] h-13 pl-12"
                    autoComplete="email"
                  />
                </div>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-white">
                    Password
                  </FieldLabel>
                  {/* You can hook this up to a reset flow later */}
                  {mode === "login" && (
                    <button
                      type="button"
                      className="ml-auto inline-block text-sm text-[#49e619] underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "login"
                        ? "Enter your password"
                        : "Choose a secure password"
                    }
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-full bg-[#152111] border-[#41533c] text-white placeholder:text-gray-500 focus:border-[#49e619] focus:ring-[#49e619] h-13 pl-12 pr-12"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Field>

              {error && (
                <Field>
                  <p className="text-xs text-red-400 bg-red-900/40 border border-red-900 rounded-full px-4 py-2 text-center">
                    {error}
                  </p>
                </Field>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#49e619] text-[#152111] hover:bg-[#3bc714] font-semibold h-13 rounded-full text-lg"
                >
                  {loading
                    ? mode === "login"
                      ? "Logging in..."
                      : "Creating account..."
                    : mode === "login"
                    ? "Login"
                    : "Sign Up"}
                </Button>

                <FieldDescription className="text-center text-gray-400 mt-2">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        className="text-[#49e619] hover:underline"
                        onClick={() => {
                          setMode("signup");
                          setError(null);
                        }}
                      >
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-[#49e619] hover:underline"
                        onClick={() => {
                          setMode("login");
                          setError(null);
                        }}
                      >
                        Log in
                      </button>
                    </>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
