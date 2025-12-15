// app/thoughts/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ThoughtCard } from "@/components/ui/thought-card";

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
    <div className="w-full min-h-screen md:px-10">
      <div className="w-full">
        <div>
          <p className="text-md text-[#33b10c] ">WELCOME BACK</p>
          <h1 className="text-4xl font-bold">Your Thoughts</h1>
        </div>
      </div>
      <div className="w-full min-h-screen mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Add New Thought Card */}
          <ThoughtCard
            variant="add"
            onClick={() => router.push("/add-thought")}
          />

          {thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              title={thought.title}
              content={thought.content}
              created_at={thought.created_at}
              variant="content"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
