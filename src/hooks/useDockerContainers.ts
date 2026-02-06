import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useDockerContainers() {
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContainers = async () => {
    try {
      const listedContainers = await docker.listContainers({ all: true });
      setContainers(listedContainers);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 2000);
    return () => clearInterval(interval);
  }, []);

  return { containers, isLoading, error };
}
