"use client";


import useFetch from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import GitHubIcon from "@mui/icons-material/GitHub";
import { ArrowUpRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Section } from "@/components/ui/section";
import DeleteProjectDangerZone from "@/components/project/DeleteProjectDangerZone";
import { ensureHttpPrefix } from "@/lib/ensureHttpPrefix";

const ProjectLogs = dynamic(() => import("@/components/project/ProjectLogs"), { ssr: false });

interface Project {
    id: number;
    user_id: number;
    user: any;
    name: string;
    description: string;
    url: string;
    repo: string;
    branch: string;
    lastUpdate: string;
    status: string;
    rootDir: string;
    buildCmd: string;
    outputDir: string;
    installCmd: string;
    subdomain: string;
    created_at: string;
}

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

export default function ProjectPage() {
    const params = useParams();
    const projectID = params?.id ? String(params.id) : "";
    const { data, isLoading, error } = useFetch<Project>({
        auto: true,
        url: projectID ? `/api/project/${projectID}` : '',
        method: 'GET',
    });
    // If API returns { project: {...} }, use that, else use data directly
    let project = (data && (data as any).project) ? (data as any).project : data;
    // Patch project.url to ensure it has http/https prefix
    if (project && project.url) {
        project = { ...project, url: ensureHttpPrefix(project.url) };
    }

    return (
        <Section className="fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 py-12!">
            <div className="max-w-container mx-auto flex flex-col">
                <div className="mx-auto flex flex-col gap-8 w-full">
                    {isLoading && <div className="flex items-center gap-2 text-muted-foreground mb-2"><Loader size={16} /> Loading project...</div>}
                    {error && <div className="text-sm mb-2 text-red-500">{error}</div>}
                    {!isLoading && !error && project && (
                        <>
                            {/* Main Card */}
                            <div className="rounded-2xl border bg-background p-0 shadow-lg overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b">
                                    <div className="text-lg font-semibold">Production Deployment</div>
                                    <div className="flex gap-2">
                                        {project.repo && (
                                            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded border text-xs">
                                                <GitHubIcon style={{ fontSize: 16 }} /> Repository
                                            </a>
                                        )}
                                        {project.url && (
                                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 text-white">
                                                Visit <ArrowUpRightIcon size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {/* Preview and Key Info */}
                                <div className="flex flex-col md:flex-row gap-6 px-6 pt-6">
                                    <div className="flex-1 min-w-80 max-w-150 rounded-xl flex items-center justify-center h-64 border">
                                        {project.url ? (
                                            <iframe
                                                src={project.url}
                                                title="Live Deployment Preview"
                                                className="w-full h-full rounded-xl border-none"
                                                style={{ background: 'white' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No preview available</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-65 flex flex-col gap-4 text-sm">
                                        {/* Deployment Name */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground">Deployment Name</span>
                                            <span className="text-base font-semibold break-all">{project.name || <span className="italic text-muted-foreground">Untitled</span>}</span>
                                        </div>
                                        {/* Status and Domain */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground">Status</span>
                                                <span className="flex items-center gap-1 text-xs font-semibold">{project.status || 'Unknown'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground">Domain / URL</span>
                                                {project.url ? (
                                                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                                        {project.subdomain || project.url}
                                                        <ArrowUpRightIcon size={10} />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs">-</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Created and Updated */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground">Created</span>
                                                <span className="text-xs">{formatDate(project.created_at)} by <span className="">{project.user?.username || "user"}</span></span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground">Last Update</span>
                                                <span className="text-xs">{formatDate(project.lastUpdate)}</span>
                                            </div>
                                        </div>
                                        {/* Source Branch */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground">Source Branch</span>
                                            <span className="text-xs">{project.branch || "main"}</span>
                                        </div>
                                        {/* Repository */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground">Repository</span>
                                            {project.repo ? (
                                                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                                    {project.repo}
                                                    <ArrowUpRightIcon size={10} />
                                                </a>
                                            ) : (
                                                <span className="text-xs">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Important Commands Section */}
                                <div className="px-6 pt-6 pb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Highlighted Commands */}
                                        <div className="flex flex-col gap-4">
                                            <div className="border rounded-lg p-3 bg-muted/50">
                                                <span className="font-semibold">Root Directory:</span> <span className="">{project.rootDir || '-'}</span>
                                                <div className="text-xs text-muted-foreground">The directory in your repo where the build starts (e.g., <span className='font-mono'>apps/web</span> or <span className='font-mono'>.</span> for root).</div>
                                            </div>
                                            <div className="border rounded-lg p-3 bg-muted/50">
                                                <span className="font-semibold">Build Command:</span> <span className="">{project.buildCmd || '-'}</span>
                                                <div className="text-xs text-muted-foreground">The command run to build your project (e.g., <span className='font-mono'>npm run build</span>).</div>
                                            </div>
                                            <div className="border rounded-lg p-3 bg-muted/50">
                                                <span className="font-semibold">Install Command:</span> <span className="">{project.installCmd || '-'}</span>
                                                <div className="text-xs text-muted-foreground">The command to install dependencies before build (e.g., <span className='font-mono'>npm install</span>).</div>
                                            </div>
                                            <div className="border rounded-lg p-3 bg-muted/50">
                                                <span className="font-semibold">Output Directory:</span> <span className="">{project.outputDir || '-'}</span>
                                                <div className="text-xs text-muted-foreground">Where the build output is placed (e.g., <span className='font-mono'>.next</span>, <span className='font-mono'>dist</span>).</div>
                                            </div>
                                        </div>
                                        {/* Description and Subdomain */}
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <span className="font-semibold">Description:</span>
                                                <div className="text-sm text-muted-foreground mt-1">{project.description || '-'}</div>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Subdomain:</span> <span className="">{project.subdomain || '-'}</span>
                                                <div className="text-xs text-muted-foreground">The subdomain assigned to this deployment (if any).</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Project Logs below main project info */}
                            <div className="mt-8">
                                <ProjectLogs projectID={projectID} />
                            </div>
                            {/* Danger Zone: Delete Project */}
                            <div className="mt-8">
                                <DeleteProjectDangerZone projectID={projectID} projectName={project.name} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Section>
    );
}
