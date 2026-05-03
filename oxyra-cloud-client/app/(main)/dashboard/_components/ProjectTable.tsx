import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ensureHttpPrefix } from "@/lib/ensureHttpPrefix";

interface Project {
  id: number;
  name: string;
  url: string;
  repo: string;
  lastUpdate: string;
  branch: string;
  status: string;
  description: string;
}

export default function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-background shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">URL</th>
            <th className="px-4 py-3 text-left font-semibold">Repo</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Description</th>
            <th className="px-4 py-3 text-left font-semibold">Last Update</th>
            <th className="px-4 py-3 text-left font-semibold">Branch</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted-foreground py-8">No projects found.</td>
            </tr>
          )}
          {projects.map(project => {
            // Patch project.url to ensure it has http/https prefix
            const patchedUrl = project.url ? ensureHttpPrefix(project.url) : "";
            return (
              <tr key={project.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{project.name}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{patchedUrl}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{project.repo}</td>
                <td className="px-4 py-2"><Badge variant="default">{project.status}</Badge></td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{project.description}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{project.lastUpdate}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{project.branch}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="ghost">Logs</Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
