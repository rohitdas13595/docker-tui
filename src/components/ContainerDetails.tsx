import React, { useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useDockerStats, type ContainerStats } from "../hooks/useDockerStats";

interface ContainerDetailsProps {
  containerId: string;
  onBack: () => void;
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
}) => {
  const stats = useDockerStats(containerId);

  useInput((input, key) => {
    if (key.escape || key.backspace || input === "q") {
      onBack();
    }
  });

  if (!stats) {
    return <Text>Loading stats for {containerId}...</Text>;
  }

  const cpuPercent = calculateCpuPercent(stats);
  const memUsage = formatBytes(stats.memory_stats.usage);
  const memLimit = formatBytes(stats.memory_stats.limit);
  const memPercent = (
    (stats.memory_stats.usage / stats.memory_stats.limit) *
    100
  ).toFixed(2);

  // Network I/O
  let rx = 0;
  let tx = 0;
  if (stats.networks) {
    Object.values(stats.networks).forEach((nw) => {
      rx += nw.rx_bytes;
      tx += nw.tx_bytes;
    });
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="magenta"
      padding={1}
    >
      <Box marginBottom={1}>
        <Text bold underline>
          Live Stats for {containerId.substring(0, 12)}
        </Text>
      </Box>

      <Box flexDirection="row" justifyContent="space-between" width="60%">
        <Box flexDirection="column" marginRight={2}>
          <Text color="cyan">CPU Usage:</Text>
          <Text bold>{cpuPercent}%</Text>
        </Box>
        <Box flexDirection="column" marginRight={2}>
          <Text color="green">Memory Usage:</Text>
          <Text bold>
            {memUsage} / {memLimit} ({memPercent}%)
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="yellow">Network I/O:</Text>
        <Text>
          {" "}
          RX: {formatBytes(rx)} / TX: {formatBytes(tx)}
        </Text>
      </Box>

      <Box marginTop={2}>
        <Text color="gray">(Press 'q' or 'Esc' to go back)</Text>
      </Box>
    </Box>
  );
};

export default ContainerDetails;
