import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useDockerNetworks() {
  const [networks, setNetworks] = useState<Docker.NetworkInspectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNetworks = async () => {
    try {
      const listedNetworks = await docker.listNetworks();
      setNetworks(listedNetworks);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
    const interval = setInterval(fetchNetworks, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshNetworks = () => {
    setIsLoading(true);
    fetchNetworks();
  };

  return { networks, isLoading, error, refreshNetworks };
}
