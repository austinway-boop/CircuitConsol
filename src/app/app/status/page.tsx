'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock, Activity, Database, Zap } from 'lucide-react';

interface EndpointStatus {
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  response_time_ms: number;
  last_checked: string;
  error?: string;
  details?: any;
  note?: string;
}

interface StatusData {
  success: boolean;
  overall_status: string;
  endpoints: {
    health: EndpointStatus;
    stats: EndpointStatus;
    analyze_text: EndpointStatus;
    analyze_audio: EndpointStatus;
    database: EndpointStatus;
  };
  server: {
    uptime_seconds: number;
    version: string;
    environment: string;
  };
  timestamp: string;
  total_response_time_ms: number;
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://circuit-68ald.ondigitalocean.app';

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/v1/status`);
      const data = await response.json();
      
      setStatusData(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      console.error('Status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      operational: 'default',
      degraded: 'secondary',
      down: 'destructive',
      unknown: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Status</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of all API endpoints
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            onClick={fetchStatus}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {statusData && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(statusData.overall_status)}
                    Overall System Status
                  </CardTitle>
                  <CardDescription>
                    All endpoints and services
                  </CardDescription>
                </div>
                {getStatusBadge(statusData.overall_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {formatUptime(statusData.server.uptime_seconds)}
                    </div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {formatResponseTime(statusData.total_response_time_ms)}
                    </div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{statusData.server.version}</div>
                    <div className="text-sm text-muted-foreground">API Version</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold capitalize">{statusData.server.environment}</div>
                    <div className="text-sm text-muted-foreground">Environment</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statusData.endpoints).map(([name, endpoint]) => (
              <Card key={name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(endpoint.status)}
                      {name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </CardTitle>
                    {getStatusBadge(endpoint.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-medium">
                      {formatResponseTime(endpoint.response_time_ms)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Checked:</span>
                    <span className="font-medium">
                      {new Date(endpoint.last_checked).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {endpoint.details && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(endpoint.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {endpoint.note && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      {endpoint.note}
                    </div>
                  )}
                  
                  {endpoint.error && (
                    <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-xs">
                      {endpoint.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Information</CardTitle>
              <CardDescription>Endpoint URLs and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <div className="font-medium">Base URL</div>
                    <div className="text-sm text-muted-foreground">{API_URL}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(API_URL)}
                  >
                    Copy
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">Text Analysis</div>
                    <code className="text-xs text-muted-foreground">POST /v1/analyze-text</code>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">Audio Analysis</div>
                    <code className="text-xs text-muted-foreground">POST /v1/analyze-audio</code>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">Statistics</div>
                    <code className="text-xs text-muted-foreground">GET /v1/stats</code>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">API Usage</div>
                    <code className="text-xs text-muted-foreground">GET /v1/usage/:apiKey</code>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">Health Check</div>
                    <code className="text-xs text-muted-foreground">GET /health</code>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="font-medium text-sm">Status (This Page)</div>
                    <code className="text-xs text-muted-foreground">GET /v1/status</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && !statusData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading status...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

