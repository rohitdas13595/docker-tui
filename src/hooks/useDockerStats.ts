import { useState, useEffect, useRef } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export interface ContainerStats {
  cpu_stats: {
    cpu_usage: {
      total_usage: number;
      percpu_usage?: number[];
    };
    system_cpu_usage: number;
    online_cpus: number;
  };
  precpu_stats: {
    cpu_usage: {
      total_usage: number;
    };
    system_cpu_usage: number;
  };
  memory_stats: {
    usage: number;
    limit: number;
    stats?: {
      cache?: number;
    };
  };
  networks?: {
    [key: string]: {
      rx_bytes: number;
      tx_bytes: number;
    };
  };
}

export function useDockerStats(containerId: string | null) {
  const [stats, setStats] = useState<ContainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const streamRef = useRef<any>(null);

  useEffect(() => {
    if (!containerId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const container = docker.getContainer(containerId);

    // We use stream: true to get live updates
    container.stats({ stream: true }, (err, stream) => {
      if (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        return;
      }

      streamRef.current = stream;
      setIsLoading(false);

      stream?.on("data", (chunk: Buffer) => {
        try {
          const data = JSON.parse(chunk.toString());
          setStats(data);
        } catch (e) {
          // Sometimes chunks are incomplete JSON, ignoring for simplicity for now
        }
      });

      stream?.on("error", (err: Error) => {
        setError(err);
      });
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.destroy();
        streamRef.current = null;
      }
    };
  }, [containerId]);

  return { stats, isLoading, error };
}
