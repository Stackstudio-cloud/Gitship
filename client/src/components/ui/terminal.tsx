import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  logs: string[];
  isLive?: boolean;
  className?: string;
}

export function Terminal({ logs, isLive = false, className }: TerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className={cn(
      "bg-dark-900 font-mono text-sm text-gray-300 p-4 rounded-lg overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-500">Terminal</span>
        </div>
        {isLive && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <span className="text-xs text-neon-green">LIVE</span>
          </div>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-1">
        {logs.map((log, index) => {
          let color = "text-gray-300";
          if (log.includes("✓") || log.includes("success")) color = "text-neon-green";
          else if (log.includes("WARN") || log.includes("warn")) color = "text-orange-500";
          else if (log.includes("ERROR") || log.includes("error")) color = "text-red-500";
          else if (log.includes("info")) color = "text-neon-cyan";
          
          return (
            <div key={index} className={color}>
              {log}
            </div>
          );
        })}
        
        {isLive && (
          <div className="flex items-center text-neon-cyan">
            <span className="animate-pulse">█</span>
            <span className="ml-2 text-gray-400">Waiting for output...</span>
          </div>
        )}
        
        <div ref={endRef} />
      </div>
    </div>
  );
}
