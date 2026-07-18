"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "./connect-wallet-screen";
import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

export function ChooseUsernameScreen() {
  const { setUsernameAndEnter } = useApp();
  const [value, setValue] = React.useState("");

  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const valid = cleaned.length >= 3 && cleaned.length <= 20;

  return (
    <OnboardingShell
      icon={<User className="h-5 w-5 text-[var(--arc-blue)]" />}
      title="Choose your username"
      subtitle="This is how contacts will find and send you funds on ARC Pilot."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setUsernameAndEnter(cleaned);
        }}
      >
        <label className="text-xs font-medium text-ink-500">Username</label>
        <div
          className={cn(
            "mt-1.5 flex items-center rounded-2xl border bg-surface px-4 h-12 transition-colors",
            valid
              ? "border-[var(--arc-blue)] ring-2 ring-[var(--arc-blue)]/15"
              : "border-border-soft focus-within:border-ink-400"
          )}
        >
          <span className="text-ink-400 text-sm mr-0.5">@</span>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="itzabhi"
            maxLength={20}
            className="focus-ring flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none h-full"
          />
          {valid && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Check className="h-4 w-4 text-[var(--success)]" />
            </motion.div>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-400">
          3–20 characters. Letters, numbers, and underscores only.
        </p>

        <Button type="submit" size="lg" className="w-full mt-6" disabled={!valid}>
          Enter ARC Pilot
        </Button>
      </form>
    </OnboardingShell>
  );
}
