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
  const streamRef = useRef<any>(null);

  useEffect(() => {
    if (!containerId) {
      setStats(null);
      return;
    }

    console.log("Fetching stats for", containerId); // Debugging

    const container = docker.getContainer(containerId);

    // We use stream: true to get live updates
    container.stats({ stream: true }, (err, stream) => {
      if (err) {
        console.error("Error getting stats:", err);
        return;
      }

      streamRef.current = stream;

      stream?.on("data", (chunk: Buffer) => {
        try {
          const data = JSON.parse(chunk.toString());
          setStats(data);
        } catch (e) {
          // Sometimes chunks are incomplete JSON, ignoring for simplicity for now
        }
      });

      stream?.on("error", (err: Error) => {
        console.error("Stream error:", err);
      });
    });

    return () => {
      if (streamRef.current) {
        // Try to destroy/close the stream
        streamRef.current.destroy();
        streamRef.current = null;
      }
    };
  }, [containerId]);

  return stats;
}
