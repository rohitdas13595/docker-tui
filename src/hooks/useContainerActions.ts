import Docker from "dockerode";
import { useState, useCallback } from "react";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export function useContainerActions(containerId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const performAction = useCallback(
    async (
      actionName: string,
      actionFn: (container: Docker.Container) => Promise<any>,
    ) => {
      setIsLoading(true);
      setActionError(null);
      setActionMessage(null);
      try {
        const container = docker.getContainer(containerId);
        await actionFn(container);
        setActionMessage(`Successfully ${actionName}ed container`);
        // Wait a bit to clear message
        setTimeout(() => setActionMessage(null), 3000);
      } catch (err: any) {
        setActionError(err.message || `Failed to ${actionName} container`);
        setTimeout(() => setActionError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [containerId],
  );

  const startContainer = useCallback(
    () => performAction("start", (c) => c.start()),
    [performAction],
  );
  const stopContainer = useCallback(
    () => performAction("stop", (c) => c.stop()),
    [performAction],
  );
  const restartContainer = useCallback(
    () => performAction("restart", (c) => c.restart()),
    [performAction],
  );
  const removeContainer = useCallback(
    () => performAction("remove", (c) => c.remove({ force: true })),
    [performAction],
  );

  return {
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    isLoading,
    actionError,
    actionMessage,
  };
}
