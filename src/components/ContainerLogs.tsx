import React from "react";
import { Box, Text, useInput } from "ink";
import { useDockerLogs } from "../hooks/useDockerLogs";
import { useTheme } from "../contexts/ThemeContext";

interface ContainerLogsProps {
  containerId: string;
  onBack: () => void;
}

const ContainerLogs: React.FC<ContainerLogsProps> = ({
  containerId,
  onBack,
}) => {
  const { logs, isLoading, error } = useDockerLogs(containerId);
  const { colors } = useTheme();

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onBack();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={colors.border}
      padding={1}
      height={20}
    >
      <Box
        marginBottom={1}
        borderStyle="single"
        borderColor={colors.textSecondary}
        paddingX={1}
      >
        <Text color={colors.highlight} bold>
          Logs for {containerId.substring(0, 12)}
        </Text>
      </Box>

      {/* Simple log view - truncated to last Lines */}
      <Box flexDirection="column">
        {error && <Text color={colors.error}>{error.message}</Text>}
        {logs.slice(-15).map((log, i) => (
          <Text key={i} wrap="truncate-end" color={colors.text}>
            {log}
          </Text>
        ))}
        {logs.length === 0 && !isLoading && !error && (
          <Text color={colors.textSecondary}>No logs or empty.</Text>
        )}
      </Box>
    </Box>
  );
};

export default ContainerLogs;
