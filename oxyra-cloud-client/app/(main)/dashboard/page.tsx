

"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { Label } from "@/components/ui/label";

const mockProjects = [
  { id: 1, name: "Oxyra Cloud", status: "Active", logs: 12 },
  { id: 2, name: "Vercel Fun", status: "Paused", logs: 3 },
  { id: 3, name: "Personal Blog", status: "Active", logs: 7 },
  { id: 4, name: "API Server", status: "Error", logs: 0 },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const filtered = mockProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Section className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
        <div className="flex-1 w-full">
          <Label htmlFor="search">Search Projects</Label>
          <Input
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="mt-1"
            size={"sm"}
            autoComplete="off"
          />
        </div>
        <Button size="sm">New Project</Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="text-muted-foreground text-center py-8">No projects found.</div>
        )}
        {filtered.map(project => (
          <div
            key={project.id}
            className="rounded-2xl border bg-background p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
          >
            <div>
              <div className="font-semibold text-lg">{project.name}</div>
              <div className="flex gap-2 mt-1">
                <Badge variant={project.status === "Active" ? "default" : project.status === "Paused" ? "secondary" : "destructive"}>
                  {project.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{project.logs} logs</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button size="sm" variant="outline">View</Button>
              <Button size="sm" variant="ghost">Logs</Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}