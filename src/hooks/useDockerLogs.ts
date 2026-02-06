import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useDockerLogs(containerId: string) {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerId) return;

    setLogs([]);
    const container = docker.getContainer(containerId);

    const streamLogs = async () => {
      try {
        const stream = await container.logs({
          follow: true,
          stdout: true,
          stderr: true,
          tail: 20,
        });

        stream.on("data", (chunk: Buffer) => {
          // Docker multiplexing header is 8 bytes.
          // Byte 0: stream type (0: stdin, 1: stdout, 2: stderr)
          // Bytes 4-7: payload length
          // We can just convert to string for simple TUI, removing some binary headers ideally,
          // but raw string usually contains the text mixed with headers.
          // For a robust TUI, we strip the header.

          let offset = 0;
          while (offset < chunk.length) {
            // const type = chunk[offset]; // 1 = stdout, 2 = stderr
            const length = chunk.readUInt32BE(offset + 4);
            const payload = chunk.subarray(offset + 8, offset + 8 + length);
            const text = payload.toString("utf-8");

            // Split by lines to array
            const lines = text.split("\n").filter(Boolean); // filter empty lines
            setLogs((prev) => [...prev, ...lines].slice(-100)); // Keep last 100 lines

            offset += 8 + length;
          }
        });

        return () => {
          // Cleanup usually implies destroying stream, but dockerode Node streams manual destroy
          // stream.destroy();
        };
      } catch (err) {
        setError(err as Error);
      }
    };

    streamLogs();
  }, [containerId]);

  return { logs, error };
}
