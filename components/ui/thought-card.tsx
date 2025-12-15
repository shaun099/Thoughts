import { CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThoughtCardProps {
  id?: string;
  title?: string | null;
  content?: string;
  created_at?: string;
  variant?: "add" | "content";
  onClick?: () => void;
  className?: string;
}

// Helper to format the date
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Helper to trim content to first few lines
function trimContent(content?: string, maxLength: number = 100): string {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
}

const BACKGROUND_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1oZAT1fRsXl0Am2FlNnLSbyRgf59WPZ2yPl5enSbpVAVlb54eFqCC9U7x5ZUW2e4tqpKkmw0Ys61ICMoQS-B3TE2k16XkNoDX6Q4ItQ8jRq673mZlhhSHpN8D4T08SRr3k3dkHf_mB4BFYYDdrC7PcMZwFrNxga9umhmSIDN8U5IIRrfQcU1_W1FYj3vyxCT8zsTXcHO0LDGXZ06qMVBQNHCRivic8acZmfBfxszwRfsm5C1tAsaR2R3mN5xeJffBsRFRNGtJ0fo";

export function ThoughtCard({
  title,
  content,
  created_at,
  variant = "content",
  onClick,
  className,
}: ThoughtCardProps) {
  if (variant === "add") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative rounded-2xl h-64 cursor-pointer border-2 border-dashed border-[#41533c] bg-[#1E261C] hover:border-[#49e619] transition-colors duration-300 flex items-center justify-center group",
          className
        )}
      >
        <CirclePlus className="h-12 w-12 text-[#41533c] group-hover:text-[#49e619] transition-colors duration-300" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl overflow-hidden h-64 group cursor-pointer",
        className
      )}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
      {/* Content */}
      <div className="relative p-5 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-300 line-clamp-4 flex-grow">
          {trimContent(content, 150)}
        </p>
        <span className="text-xs text-[#49e619] mt-3">
          {formatDate(created_at)}
        </span>
      </div>
    </div>
  );
}
