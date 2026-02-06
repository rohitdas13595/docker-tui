import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useDockerLogs(containerId: string) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setError(null);
    const container = docker.getContainer(containerId);

    const streamLogs = async () => {
      try {
        const stream = await container.logs({
          follow: true,
          stdout: true,
          stderr: true,
          tail: 20,
        });

        setIsLoading(false);

        stream.on("data", (chunk: Buffer) => {
          let offset = 0;
          while (offset < chunk.length) {
            if (offset + 8 > chunk.length) break;
            const length = chunk.readUInt32BE(offset + 4);
            if (offset + 8 + length > chunk.length) break;

            const payload = chunk.subarray(offset + 8, offset + 8 + length);
            const text = payload.toString("utf-8");

            const lines = text.split("\n").filter(Boolean);
            setLogs((prev) => [...prev, ...lines].slice(-100));

            offset += 8 + length;
          }
        });

        // Return stream destroyer if possible, but dockerode type on stream varies.
        // Assuming stream is readable.
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    streamLogs();
  }, [containerId]);

  return { logs, isLoading, error };
}
