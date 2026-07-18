import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The ARC mark — the official brand logo, used consistently as the single
 * source of truth across navbar, sidebar, favicon, loading states, and the
 * Smart Wallet card. The asset already ships with its own dark badge
 * background, so it reads correctly on both light and dark surfaces.
 */
export function ArcMark({
  className,
  size = 36,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  /** @deprecated no longer used — kept for backwards-compatible call sites */
  flat?: boolean;
}) {
  return (
    <Image
      src="/brand/arc-logo.png"
      alt="ARC"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-[22%] select-none", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

export function ArcLogo({
  className,
  size = 36,
  showWordmark = true,
  tagline = false,
  priority = false,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  tagline?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ArcMark size={size} priority={priority} />
      {showWordmark && (
        <div className="leading-tight">
          <div className="font-semibold text-[15px] tracking-tight text-ink-900">
            ARC Pilot
          </div>
          {tagline && (
            <div className="text-[11px] text-ink-400 -mt-0.5">
              AI Wallet for ARC
            </div>
          )}
        </div>
      )}
    </div>
  );
}
