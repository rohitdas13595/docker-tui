import React, { useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useDockerStats, type ContainerStats } from "../hooks/useDockerStats";
import { useContainerActions } from "../hooks/useContainerActions";
import { useTheme } from "../contexts/ThemeContext";

interface ContainerDetailsProps {
  containerId: string;
  onBack: () => void;
  onViewLogs: (containerId: string) => void;
}

function calculateCpuPercent(stats: ContainerStats) {
  if (!stats || !stats.cpu_stats || !stats.precpu_stats) return "0.00";

  const cpuDelta =
    stats.cpu_stats.cpu_usage.total_usage -
    stats.precpu_stats.cpu_usage.total_usage;
  const systemCpuDelta =
    stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const numberCpus =
    stats.cpu_stats.online_cpus ||
    stats.cpu_stats.cpu_usage.percpu_usage?.length ||
    1;

  if (systemCpuDelta > 0 && cpuDelta > 0) {
    const percent = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
    return percent.toFixed(2);
  }
  return "0.00";
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const ContainerDetails: React.FC<ContainerDetailsProps> = ({
  containerId,
  onBack,
  onViewLogs,
}) => {
  const { stats, isLoading, error } = useDockerStats(containerId);
  const {
    startContainer,
    stopContainer,
    restartContainer,
    isLoading: isActionLoading,
    actionMessage,
    actionError,
  } = useContainerActions(containerId);
  const { colors } = useTheme();

  useInput((input, key) => {
    if (key.escape || key.backspace || input === "q") {
      onBack();
    }
    if (input === "s") {
      startContainer();
    }
    if (input === "x") {
      stopContainer();
    }
    if (input === "r") {
      restartContainer();
    }
    if (input === "l") {
      onViewLogs(containerId);
    }
  });

  // The following calculations are based on the original structure.
  // If useDockerStats is updated to return pre-formatted stats, these might become redundant.
  const cpuPercent = stats ? calculateCpuPercent(stats) : "0.00";
  const memUsage = stats ? formatBytes(stats.memory_stats.usage) : "0 B";
  const memLimit = stats ? formatBytes(stats.memory_stats.limit) : "0 B";
  const memPercent = stats
    ? ((stats.memory_stats.usage / stats.memory_stats.limit) * 100).toFixed(2)
    : "0.00";

  let rx = 0;
  let tx = 0;
  if (stats && stats.networks) {
    Object.values(stats.networks).forEach((nw) => {
      rx += nw.rx_bytes;
      tx += nw.tx_bytes;
    });
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={colors.border}
      padding={1}
    >
      <Box marginBottom={1}>
        <Text bold underline color={colors.text}>
          Live Stats for {containerId.substring(0, 12)}
        </Text>
      </Box>

      {error && <Text color={colors.error}>Error: {error.message}</Text>}

      <Box flexDirection="column" marginBottom={1}>
        {stats ? (
          <>
            <Box flexDirection="row" justifyContent="space-between">
              <Box width="50%">
                <Text color={colors.text}>CPU Usage: {cpuPercent}%</Text>
              </Box>
              <Box width="50%">
                <Text color={colors.text}>
                  Memory Usage: {memUsage} / {memLimit} ({memPercent}%)
                </Text>
              </Box>
            </Box>
            <Box marginTop={1}>
              <Text color={colors.text}>
                Network I/O: RX: {formatBytes(rx)} / TX: {formatBytes(tx)}
              </Text>
            </Box>
          </>
        ) : (
          <Text color={colors.textSecondary}>
            {isLoading ? "Loading stats..." : "Waiting for stats..."}
          </Text>
        )}
      </Box>

      <Box
        borderStyle="single"
        borderColor={colors.highlight}
        padding={1}
        flexDirection="column"
      >
        <Box flexDirection="row" justifyContent="space-around">
          <Text color={colors.text}>
            Actions: [S]tart | [X]Stop | [R]estart | [L]ogs
          </Text>
        </Box>
        {(actionMessage || actionError || isActionLoading) && (
          <Box marginTop={1} justifyContent="center">
            {isActionLoading && (
              <Text color={colors.warning}>Executing...</Text>
            )}
            {actionMessage && (
              <Text color={colors.success}>{actionMessage}</Text>
            )}
            {actionError && <Text color={colors.error}>{actionError}</Text>}
          </Box>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color={colors.textSecondary}>
          (Press 'q' or 'Esc' to go back)
        </Text>
      </Box>
    </Box>
  );
};

export default ContainerDetails;
