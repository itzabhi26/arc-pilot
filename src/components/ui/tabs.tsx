"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-surface-3 p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "focus-ring rounded-full px-3 py-1.5 text-xs font-medium text-ink-500 transition-all data-[state=active]:bg-surface data-[state=active]:text-ink-900 data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
