import { useState, useCallback } from "react";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useImageActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const removeImage = useCallback(async (imageId: string) => {
    setIsLoading(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const image = docker.getImage(imageId);
      await image.remove({ force: false }); // Don't force by default, safer
      setActionMessage(
        `Successfully removed image ${imageId.substring(0, 12)}`,
      );
      setTimeout(() => setActionMessage(null), 3000);
      return true;
    } catch (err: any) {
      setActionError(err.message || `Failed to remove image`);
      setTimeout(() => setActionError(null), 5000);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    removeImage,
    isLoading,
    actionError,
    actionMessage,
  };
}
