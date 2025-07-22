import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Download, RefreshCw, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuildStep {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface BuildLogsProps {
  deploymentId: number;
  status: 'building' | 'success' | 'failed' | 'cancelled';
  onRetrigger?: () => void;
}

export default function BuildLogs({ deploymentId, status, onRetrigger }: BuildLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status === 'building') {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [deploymentId, status]);

  useEffect(() => {
    if (isAutoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        deploymentId: deploymentId.toString() 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log' && data.deploymentId === deploymentId.toString()) {
          setLogs(prev => [...prev, data.message]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const downloadLogs = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-logs-${deploymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'building': return 'bg-yellow-500';
      case 'success': return 'bg-neon-green';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'building': return 'Building';
      case 'success': return 'Deployed';
      case 'failed': return 'Failed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="bg-dark-800 border-dark-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5 text-neon-cyan" />
            <CardTitle className="text-white">Build Logs</CardTitle>
            <Badge variant="outline" className={cn("text-white border-0", getStatusColor())}>
              {getStatusText()}
            </Badge>
            {status === 'building' && (
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-neon-green animate-pulse" : "bg-red-500"
                )} />
                <span className="text-xs text-gray-400">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className="border-gray-600 text-white hover:bg-dark-700"
            >
              <RefreshCw className={cn("w-4 h-4", isAutoScroll && "animate-spin")} />
              Auto-scroll
            </Button>
            
            {logs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadLogs}
                className="border-gray-600 text-white hover:bg-dark-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
            
            {status === 'failed' && onRetrigger && (
              <Button
                size="sm"
                onClick={onRetrigger}
                className="bg-neon-green text-dark-900 hover:bg-neon-green/90"
              >
                <Play className="w-4 h-4 mr-1" />
                Retry Build
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-96 w-full bg-dark-900 border border-dark-600 rounded-b-lg"
        >
          <div className="p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                {status === 'building' ? 'Waiting for build logs...' : 'No logs available'}
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 leading-relaxed">
                  {log}
                </div>
              ))
            )}
            
            {status === 'building' && (
              <div className="text-neon-cyan animate-pulse mt-2">
                Building...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}