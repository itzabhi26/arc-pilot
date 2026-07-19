"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { ConnectWalletScreen } from "@/components/onboarding/connect-wallet-screen";
import { WrongNetworkScreen } from "@/components/onboarding/wrong-network-screen";
import { CreateSmartWalletScreen } from "@/components/onboarding/create-wallet-screen";
import { ChooseUsernameScreen } from "@/components/onboarding/username-screen";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ArcMark } from "@/components/logo";

export default function AppEntry() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Wallet state (window.ethereum, localStorage) only exists client-side —
  // rendering nothing until mount avoids any server/client markup mismatch.
  if (!mounted) return <LoadingScreen />;

  return <Gate />;
}

function Gate() {
  const { step, address, sessionChecked, hadStoredSession } = useApp();
  const router = useRouter();
  // Tracks whether this tab has held a connected session at any point,
  // so we can tell "just disconnected" apart from "arrived fresh".
  const hadAddressRef = React.useRef(false);

  React.useEffect(() => {
    if (address) {
      hadAddressRef.current = true;
      return;
    }

    // Session restoration (silent reconnect on refresh) is still in
    // flight — do not make any redirect decision yet, or a refresh while
    // still connected would get bounced to the landing page before the
    // wallet had a chance to reconnect.
    if (!sessionChecked) return;

    // Only redirect a disconnected visitor back to the landing page if
    // they were previously connected — either earlier in this same tab
    // (hadAddressRef, e.g. just clicked Disconnect), or on this device
    // before a refresh (hadStoredSession, read from localStorage, which
    // — unlike the Performance Navigation Timing API — correctly reflects
    // *this* visit rather than being stuck at whatever the very first
    // page load of the tab happened to be). A first-time visitor who
    // simply clicked into /app should just see the connect screen, not
    // get bounced back to "/".
    if (hadStoredSession || hadAddressRef.current) {
      router.replace("/");
    }
  }, [address, sessionChecked, hadStoredSession, router]);

  // Still attempting to silently restore a previous session — show a
  // neutral loading state rather than flashing the connect screen or
  // (worse) redirecting away before reconnect had a chance to finish.
  if (!address && !sessionChecked) return <LoadingScreen />;

  if (step === "dashboard") return <DashboardShell />;
  if (step === "username") return <ChooseUsernameScreen />;
  if (step === "create-wallet") return <CreateSmartWalletScreen />;
  if (step === "wrong-network") return <WrongNetworkScreen />;
  return <ConnectWalletScreen />;
}

function LoadingScreen() {
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
