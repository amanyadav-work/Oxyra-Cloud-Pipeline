
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Loader from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

const WS_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "ws://localhost:8080"
  : `wss://${typeof window !== "undefined" ? window.location.host : ""}`;

const urlRegex = /(https?:\/\/[\w\-\.\?,'\/\\\+&%\$#_=~:;@!\(\)]+)(?![^<]*>|[^\"]*?)/g;

function highlightUrls(str: string) {
  return str.replace(urlRegex, url =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0074d9;text-decoration:underline;">${url} <span style='font-size:13px;'>&#8599;</span></a>`
  );
}

const Page = () => {
  const [projectID, setProjectID] = useState<string>("test");
  const [status, setStatus] = useState<string>("Waiting for connection...");
  const [error, setError] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logsDivRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket
  const connect = (id: string) => {
    setConnecting(true);
    setStatus("Connecting...");
    setError("");
    setLogs([]);
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`${WS_BASE}/ws/logs/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected");
      setConnecting(false);
    };
    ws.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        const formatted = JSON.stringify(jsonData, null, 2);
        setLogs(prev => [...prev, highlightUrls(formatted)]);
      } catch (e) {
        setError("Error: Invalid JSON received!");
      }
    };
    ws.onclose = () => {
      setStatus("Connection closed");
      setConnecting(false);
    };
    ws.onerror = (err: any) => {
      setError("WebSocket error");
      setConnecting(false);
    };
  };

  // Auto-connect on mount
  useEffect(() => {
    connect(projectID);
    // Cleanup
    return () => {
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new log
  useEffect(() => {
    if (logsDivRef.current) {
      logsDivRef.current.scrollTop = logsDivRef.current.scrollHeight;
    }
  }, [logs]);

  const handleConnect = (e?: React.FormEvent) => {
    e?.preventDefault();
    connect(projectID);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Logs Viewer</h1>
      <form
        className="flex flex-col sm:flex-row gap-4 items-end mb-6"
        onSubmit={handleConnect}
      >
        <div className="flex-1 w-full">
          <Label htmlFor="projectID">Project ID</Label>
          <Input
            id="projectID"
            value={projectID}
            onChange={e => setProjectID(e.target.value)}
            placeholder="Enter project ID"
            className="mt-1"
            autoComplete="off"
          />
        </div>
        <Button type="submit" size="sm" disabled={connecting} className="min-w-[100px]">
          {connecting ? <Loader size={16} /> : "Connect"}
        </Button>
      </form>

      <div className="text-sm mb-2 text-muted-foreground min-h-[24px]" id="status">
        {status}
      </div>
      {error && (
        <div className="text-sm mb-2 text-red-500 min-h-[24px]" id="error">
          {error}
        </div>
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
          logs.map((log, idx) => (
            <pre
              key={idx}
              className="text-xs mb-2 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Page;