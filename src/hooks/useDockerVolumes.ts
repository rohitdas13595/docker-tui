import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export interface VolumeInfo {
  Name: string;
  Driver: string;
  Mountpoint: string;
  Labels: { [key: string]: string } | null;
  Scope: string;
  Options: { [key: string]: string } | null;
  CreatedAt?: string;
}

export function useDockerVolumes() {
  const [volumes, setVolumes] = useState<VolumeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVolumes = async () => {
    try {
      const result = await docker.listVolumes();
      // dockerode typings might be slightly loose on listVolumes return, usually it returns { Volumes: [...] }
      // let's assume result.Volumes based on standard Docker API
      // @ts-ignore
      setVolumes(result.Volumes || []);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
    const interval = setInterval(fetchVolumes, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshVolumes = () => {
    setIsLoading(true);
    fetchVolumes();
  };

  return { volumes, isLoading, error, refreshVolumes };
}
