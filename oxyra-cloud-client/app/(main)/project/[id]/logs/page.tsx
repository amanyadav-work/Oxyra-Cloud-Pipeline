
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import useFetch from "@/hooks/useFetch";
import { Section } from "@/components/ui/section";

const WS_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "ws://localhost:8080"
  : `wss://${typeof window !== "undefined" ? window.location.host : ""}`;

const urlRegex = /(https?:\/\/[\w\-\.\?,'\/\\\+&%\$#_=~:;@!\(\)]+)(?![^<]*>|[^\"]*?)/g;
function highlightUrls(str: string) {
  return str.replace(urlRegex, url =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0074d9;text-decoration:underline;">${url} <span style='font-size:13px;'>&#8599;</span></a>`
  );
}

function formatTimestamp(ts: string) {
  if (!ts) return "-";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "2-digit",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}


interface LogObj {
  id: number;
  project_id: string;
  message: string;
  timestamp: string;
}


const SAMPLE_LOGS: LogObj[] = [];

// Regex to match [INFO] Your site is live! View it here: <url>
const LIVE_SITE_LOG_REGEX = /^\[INFO\] Your site is live! View it here: (\S+)/i;



const Page = () => {
  const params = useParams();
  const projectID = params?.id ? String(params.id) : "";
  const [status, setStatus] = useState<string>("Waiting for connection...");
  const [error, setError] = useState<string>("");
  const [logs, setLogs] = useState<LogObj[]>([]);
  // Fetch logs from DB on mount
  const { data: dbLogs, isLoading: dbLoading, error: dbError, refetch } = useFetch<LogObj[]>({
    auto: true,
    url: projectID ? `/api/project/${projectID}/logs` : '',
    method: 'GET',
    onSuccess: (result) => {
      if (Array.isArray(result.logs) && result.logs.length > 0) {
        setLogs(result.logs);
      }
    },
  });

  // State for deployment URL (if found in logs)
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logsDivRef = useRef<HTMLDivElement>(null);

  // Check for live site log in DB logs (only last log)
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const match = LIVE_SITE_LOG_REGEX.exec(lastLog.message);
      if (match) {
        let url = match[1];
        if (!/^https?:\/\//.test(url)) {
          url = `http://${url}`;
        }
        setDeploymentUrl(url);
        return;
      }
    }
    setDeploymentUrl("");
  }, [logs]);

  // Connect to WebSocket after DB logs, only if deploymentUrl is not found (i.e., live site log is not last log)
  useEffect(() => {
    if (!projectID || deploymentUrl) return;
    setConnecting(true);
    setStatus("Connecting...");
    setError("");
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`${WS_BASE}/ws/logs/${projectID}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected");
      setConnecting(false);
      setError(""); // Clear error on successful connection
    };
    ws.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        // Only push if message exists
        if (jsonData && jsonData.message) {
          setLogs(prev => [
            ...prev,
            {
              id: jsonData.id,
              project_id: jsonData.project_id,
              message: jsonData.message,
              timestamp: jsonData.timestamp
            }
          ]);
        }
      } catch (e) {
        setError("Error: Invalid JSON received!");
      }
    };
    ws.onclose = () => {
      setStatus("Connection closed");
      setConnecting(false);
      setError("");
    };
    ws.onerror = (err: any) => {
      if (ws.readyState !== WebSocket.OPEN) {
        setError("WebSocket error");
      }
      console.log("WebSocket error:", JSON.stringify(err, null, 2), err);
      setConnecting(false);
    };

    return () => {
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, deploymentUrl]);

  // Scroll to bottom on new log
  useEffect(() => {
    if (logsDivRef.current) {
      logsDivRef.current.scrollTop = logsDivRef.current.scrollHeight;
    }
  }, [logs]);

  // If no logs after 2s, show sample logs (only if not loading from DB)
  useEffect(() => {
    if (logs.length === 0 && !connecting && !dbLoading) {
      const timer = setTimeout(() => {
        if (logs.length === 0) setLogs(SAMPLE_LOGS);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [logs, connecting, dbLoading]);

  return (
    <Section className="fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 py-12!">
      <div className="max-w-container mx-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-left">Logs Viewer</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logs column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Project ID: <span className=" text-foreground">{projectID}</span></div>
              <div className="text-xs text-muted-foreground" id="status">{status}</div>
            </div>
            {error && (
              <div className="text-sm mb-2 text-red-500 min-h-[24px]" id="error">
                {error}
              </div>
            )}
            {dbLoading && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2"><Loader size={16} /> Loading logs from database...</div>
            )}
            {dbError && (
              <div className="text-sm mb-2 text-red-500">{dbError}</div>
            )}
            <div
              ref={logsDivRef}
              className={cn(
                "rounded-2xl border bg-background p-4 max-h-96 overflow-y-auto min-h-[120px]",
                logs.length === 0 && "flex items-center justify-center text-muted-foreground"
              )}
              id="logs"
            >
              {logs.length === 0 ? (
                <span>Waiting for logs...</span>
              ) : (
                <ul className="space-y-2 w-full">
                  {logs.map((log, idx) => (
                    <li
                      key={idx}
                      className="flex flex-col gap-1 animate-appear py-4 border-b last:border-0"
                      style={{ animationDuration: '0.6s' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{formatTimestamp(log.timestamp)}</span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground font-mono">{log.project_id}</span>
                      </div>
                      <div
                        className="text-sm text-foreground whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: highlightUrls(log.message) }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Iframe column */}
          <div className="w-full flex-1 max-w-full flex flex-col gap-4">
            {deploymentUrl ? (
              <>
                <div className="mb-2">
                  <span className="text-sm">Live deployment:&nbsp;</span>
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {deploymentUrl}
                    <span className="ml-1" style={{ fontSize: 13 }}>&#8599;</span>
                  </a>
                </div>
                <iframe
                  src={deploymentUrl}
                  title="Live Deployment"
                  className="w-full h-96 rounded-xl border"
                  style={{ background: '#fff' }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-96 w-full rounded-xl border bg-background text-muted-foreground">
                Loading deployment preview...
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Page;