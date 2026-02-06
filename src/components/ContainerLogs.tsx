import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { useDockerLogs } from "../hooks/useDockerLogs";

interface ContainerLogsProps {
  containerId: string;
  onBack: () => void;
}

const ContainerLogs: React.FC<ContainerLogsProps> = ({
  containerId,
  onBack,
}) => {
  const { logs, error } = useDockerLogs(containerId);
  const [autoScroll, setAutoScroll] = useState(true);

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onBack();
    }
    // Could implement manual scrolling here later
  });

  // Use a small effect to "stick" to bottom if we were real scrolling div,
  // but in TUI rendering array, we just render the last N lines naturally.

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      padding={1}
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold underline>
          Logs for {containerId.substring(0, 12)} (Tail 100)
        </Text>
      </Box>

      {error && <Text color="red">Error fetching logs: {error.message}</Text>}

      <Box flexDirection="column" flexGrow={1}>
        {logs.length === 0 && !error && (
          <Text color="gray">No recent logs or initializing...</Text>
        )}
        {logs.map((log, index) => (
          <Text key={index} wrap="truncate-end">
            {log}
          </Text>
        ))}
      </Box>

      <Box
        marginTop={1}
        borderStyle="single"
        borderTop={true}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderColor="gray"
      >
        <Text color="gray">Press 'q' or 'Esc' to go back.</Text>
      </Box>
    </Box>
  );
};

export default ContainerLogs;
