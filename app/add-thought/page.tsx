// app/add-thought/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ✅ Your Supabase client
import { supabase } from "@/lib/supabaseClient";

export default function AddThoughtPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState(""); // not stored yet in DB, but kept for future use
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1️⃣ Get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("You must be logged in to add a thought.");
      }

      // 2️⃣ Insert into diary_entries
      const { error: insertError } = await supabase
        .from("diary_entries")
        .insert({
          user_id: user.id,
          title: title || null, // title is nullable in your schema
          content: body,
          // tag is not in the table yet; add column later if you want to store it
        });

      if (insertError) throw insertError;

      // 3️⃣ Redirect back to thoughts list
      router.push("/thoughts");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Something went wrong while saving your thought."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-[#2c3829]/40 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/thoughts")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold">New Thought</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-[#1e2a1d] border-[#2c3829] rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Capture a new thought
              </CardTitle>
              <CardDescription className="text-gray-400">
                Give it a clear title and write what&apos;s on your mind.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-200">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="What’s on your mind?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#152111] border-[#41533c] text-white placeholder:text-gray-500 rounded-2xl h-12 focus:border-[#49e619] focus:ring-[#49e619]"
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label htmlFor="body" className="text-gray-200">
                    Thought
                  </Label>
                  <textarea
                    id="body"
                    rows={8}
                    placeholder="Start typing..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-[#152111] border border-[#41533c] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49e619] focus:border-[#49e619] resize-none"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-400 bg-red-900/30 border border-red-900/60 rounded-2xl px-4 py-2">
                    {error}
                  </p>
                )}

                <CardFooter className="flex items-center justify-between px-0 pt-4">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/thoughts")}
                      className="rounded-full px-5 text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#49e619] text-[#152111] hover:bg-[#3bc714] px-8 font-semibold"
                    >
                      {saving ? "Saving..." : "Save Thought"}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
