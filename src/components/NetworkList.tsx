import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Docker from "dockerode";
import { useTheme } from "../contexts/ThemeContext";

interface NetworkListProps {
  networks: Docker.NetworkInspectInfo[];
  onRefresh: () => void;
}

const LIMIT = 10;
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const NetworkList: React.FC<NetworkListProps> = ({ networks, onRefresh }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { colors } = useTheme();

  useInput(async (input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => {
        const newIndex = Math.max(0, prev - 1);
        if (newIndex < offset) {
          setOffset(newIndex);
        }
        return newIndex;
      });
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => {
        const newIndex = Math.min(networks.length - 1, prev + 1);
        if (newIndex >= offset + LIMIT) {
          setOffset(newIndex - LIMIT + 1);
        }
        return newIndex;
      });
    }

    // Delete action
    if (input === "x" || key.delete) {
      if (networks[selectedIndex]) {
        const netId = networks[selectedIndex].Id;
        try {
          const network = docker.getNetwork(netId);
          await network.remove();
          setActionMessage(`Removed network ${networks[selectedIndex].Name}`);
          setTimeout(() => setActionMessage(null), 3000);
          onRefresh();
        } catch (err: any) {
          setActionError(err.message || "Failed to remove network");
          setTimeout(() => setActionError(null), 5000);
        }
      }
    }
  });

  // Handle list changes
  React.useEffect(() => {
    if (selectedIndex >= networks.length && networks.length > 0) {
      setSelectedIndex(Math.max(0, networks.length - 1));
    }
  }, [networks.length]);

  if (networks.length === 0) {
    return (
      <Box borderStyle="round" borderColor={colors.warning} padding={1}>
        <Text color={colors.warning}>No networks found.</Text>
      </Box>
    );
  }

  const visibleNetworks = networks.slice(offset, offset + LIMIT);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Box marginBottom={1}>
        <Box width="20%">
          <Text underline color={colors.textSecondary}>
            ID
          </Text>
        </Box>
        <Box width="30%">
          <Text underline color={colors.textSecondary}>
            Name
          </Text>
        </Box>
        <Box width="20%">
          <Text underline color={colors.textSecondary}>
            Driver
          </Text>
        </Box>
        <Box width="30%">
          <Text underline color={colors.textSecondary}>
            Scope
          </Text>
        </Box>
      </Box>
      {visibleNetworks.map((net, index) => {
        const actualIndex = offset + index;
        const isSelected = actualIndex === selectedIndex;
        const shortId = net.Id.substring(0, 12);

        return (
          <Box key={net.Id}>
            <Box width="20%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                bold={isSelected}
              >
                {isSelected ? "> " : "  "}
                {shortId}
              </Text>
            </Box>
            <Box width="30%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                bold={isSelected}
              >
                {net.Name}
              </Text>
            </Box>
            <Box width="20%">
              <Text color={isSelected ? colors.highlight : colors.text}>
                {net.Driver}
              </Text>
            </Box>
            <Box width="30%">
              <Text color={isSelected ? colors.highlight : colors.text}>
                {net.Scope}
              </Text>
            </Box>
          </Box>
        );
      })}
      <Box marginTop={1} justifyContent="space-between">
        <Box>
          <Text color={colors.textSecondary}>
            Showing {offset + 1}-{Math.min(offset + LIMIT, networks.length)} of{" "}
            {networks.length}
          </Text>
        </Box>
        <Box>
          {actionMessage && <Text color={colors.success}>{actionMessage}</Text>}
          {actionError && <Text color={colors.error}>{actionError}</Text>}
          {!actionMessage && !actionError && (
            <Text color={colors.textSecondary}>
              Press 'x' to remove network
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NetworkList;
