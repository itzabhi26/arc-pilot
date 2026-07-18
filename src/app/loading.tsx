import { ArcMark } from "@/components/logo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--arc-blue)] border-r-[var(--arc-violet)] animate-spin" />
          <ArcMark size={26} />
        </div>
        <p className="text-xs text-ink-400">Loading ARC Pilot…</p>
      </div>
    </div>
  );
}
