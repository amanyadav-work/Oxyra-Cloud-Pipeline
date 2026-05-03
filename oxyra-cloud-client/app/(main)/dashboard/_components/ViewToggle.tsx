"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type ViewType = "grid" | "table";

export default function ViewToggle({ view, setView }: { view: ViewType; setView: (v: ViewType) => void }) {
  return (
    <div className="flex gap-2 items-center">
      <Button
        size="icon"
        variant={view === "grid" ? "default" : "outline"}
        aria-label="Grid view"
        onClick={() => setView("grid")}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/></svg>
      </Button>
      <Button
        size="icon"
        variant={view === "table" ? "default" : "outline"}
        aria-label="Table view"
        onClick={() => setView("table")}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="16" width="18" height="3" rx="1.5" fill="currentColor"/></svg>
      </Button>
    </div>
  );
}
