import { useState, useEffect } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useDockerImages() {
  const [images, setImages] = useState<Docker.ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchImages = async () => {
    try {
      const listedImages = await docker.listImages();
      setImages(listedImages);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // Refresh less frequently than containers? or same?
    // Images don't change state as often as containers, but pull/delete happens.
    const interval = setInterval(fetchImages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Explicit refresh capability
  const refreshImages = () => {
    setIsLoading(true);
    fetchImages();
  };

  return { images, isLoading, error, refreshImages };
}
