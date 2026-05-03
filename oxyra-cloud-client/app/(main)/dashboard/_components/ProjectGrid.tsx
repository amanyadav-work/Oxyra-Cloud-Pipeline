import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VercelIcon from "@mui/icons-material/ChangeHistory";
import GitHubIcon from "@mui/icons-material/GitHub";
import BranchIcon from "@mui/icons-material/CallSplit";
import { ArrowUpRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ensureHttpPrefix } from "@/lib/ensureHttpPrefix";

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function trimUrl(url: string) {
  if (!url) return "-";
  return url.replace(/(^https?:\/\/)/, "").replace(/\/$/, "");
}

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

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const router = useRouter();
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
      {projects.length === 0 && (
        <div className="col-span-full text-muted-foreground text-center py-8">No projects found.</div>
      )}
      {projects.map((project) => {
        const patchedUrl = project.url ? ensureHttpPrefix(project.url) : "";
        return (
          <div
            key={project.id}
            className="rounded-2xl border bg-background p-0 flex flex-col shadow-sm min-h-[170px] hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/project/${project.id}`)}
          >
            <div className="flex items-center gap-3 px-4 pt-4 pb-4">
              <span className="text-black/80 dark:text-white/80 p-2 flex items-center justify-center border rounded-full">
                <VercelIcon fontSize="medium" style={{ opacity: 0.8 }} />
              </span>
              <div className="flex-1 flex flex-row justify-between items-center min-w-0">
                <div className="font-semibold text-base flex flex-col items-start gap-1 flex-wrap">
                  {project.name || <span className="italic text-muted-foreground">Untitled</span>}
                  {patchedUrl && (
                    <a
                      href={patchedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-muted-foreground hover:underline flex items-center gap-1 max-w-md overflow-hidden whitespace-nowrap truncate"
                    >
                      {trimUrl(project.url)}
                      <ArrowUpRightIcon size={10} />
                    </a>
                  )}
                </div>
                {project.status ? (
                  <Badge variant="default">{project.status}</Badge>
                ) : (
                  <Badge variant="secondary">No Status</Badge>
                )}
              </div>
            </div>
            <div className="border-t py-4">
              {project.description && (
                <div className="text-xs text-muted-foreground px-4 ">
                  {project.description}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t ">
              <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
                <span>{formatDate(project.lastUpdate)}</span>
                <div className="flex gap-2 mt-1 flex-wrap items-center">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                    >
                      <GitHubIcon style={{ fontSize: 16, verticalAlign: "middle" }} />
                      {project.repo.split("github.com/")[1]}
                    </a>
                  )}
                  {project.branch && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BranchIcon style={{ fontSize: 16, verticalAlign: "middle" }} />
                      {project.branch}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}