// app/thoughts/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Thought = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
};

export default function ThoughtsPage() {
  const router = useRouter();
  const [userChecked, setUserChecked] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingThoughts, setLoadingThoughts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth & load thoughts
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserChecked(true);

      const { data, error } = await supabase
        .from("diary_entries") // <- table name
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load thoughts.");
      } else if (data) {
        setThoughts(data as Thought[]);
      }

      setLoadingThoughts(false);
    };

    init();
  }, [router]);

  const handleAddThought = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Both headline and paragraph are required.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("diary_entries")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setThoughts((prev) => [data as Thought, ...prev]);
      setTitle("");
      setContent("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save thought.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!userChecked) {
    return <p className="text-sm text-slate-400">Checking session...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Your Thoughts</h1>
          <p className="text-xs text-slate-400">
            Add a headline and a paragraph for each thought.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs border border-slate-600 rounded px-3 py-1 hover:bg-slate-800"
        >
          Log out
        </button>
      </header>

      {/* New thought form */}
      <section className="border border-slate-700 rounded-lg p-4 space-y-3 bg-slate-900/40">
        <h2 className="text-sm font-medium">Add a new thought</h2>

        <form onSubmit={handleAddThought} className="space-y-3">
          <input
            type="text"
            placeholder="Headline"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your paragraph..."
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm min-h-[120px] outline-none focus:border-sky-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded bg-sky-600 text-sm font-medium px-4 py-2 hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save thought"}
          </button>
        </form>
      </section>

      {/* Thoughts list */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Previous thoughts</h2>

        {loadingThoughts ? (
          <p className="text-sm text-slate-400">Loading your thoughts...</p>
        ) : thoughts.length === 0 ? (
          <p className="text-sm text-slate-500">
            You haven&apos;t written anything yet. Start with your first thought!
          </p>
        ) : (
          <ul className="space-y-3">
            {thoughts.map((t) => (
              <li
                key={t.id}
                className="border border-slate-700 rounded-lg p-3 bg-slate-900/40"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm">
                    {t.title || "(No headline)"}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {t.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
