import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { VolumeInfo } from "../hooks/useDockerVolumes";
import Docker from "dockerode";
import { useTheme } from "../contexts/ThemeContext";

interface VolumeListProps {
  volumes: VolumeInfo[];
  onRefresh: () => void;
}

const LIMIT = 10;
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const VolumeList: React.FC<VolumeListProps> = ({ volumes, onRefresh }) => {
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
        const newIndex = Math.min(volumes.length - 1, prev + 1);
        if (newIndex >= offset + LIMIT) {
          setOffset(newIndex - LIMIT + 1);
        }
        return newIndex;
      });
    }

    // Delete action
    if (input === "x" || key.delete) {
      if (volumes[selectedIndex]) {
        const volumeName = volumes[selectedIndex].Name;
        try {
          const volume = docker.getVolume(volumeName);
          await volume.remove();
          setActionMessage(`Removed volume ${volumeName}`);
          setTimeout(() => setActionMessage(null), 3000);
          onRefresh();
        } catch (err: any) {
          setActionError(err.message || "Failed to remove volume");
          setTimeout(() => setActionError(null), 5000);
        }
      }
    }
  });

  // Handle list changes
  React.useEffect(() => {
    if (selectedIndex >= volumes.length && volumes.length > 0) {
      setSelectedIndex(Math.max(0, volumes.length - 1));
    }
  }, [volumes.length]);

  if (volumes.length === 0) {
    return (
      <Box borderStyle="round" borderColor={colors.warning} padding={1}>
        <Text color={colors.warning}>No volumes found.</Text>
      </Box>
    );
  }

  const visibleVolumes = volumes.slice(offset, offset + LIMIT);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Box marginBottom={1}>
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
        <Box width="50%">
          <Text underline color={colors.textSecondary}>
            Mountpoint
          </Text>
        </Box>
      </Box>
      {visibleVolumes.map((volume, index) => {
        const actualIndex = offset + index;
        const isSelected = actualIndex === selectedIndex;
        const shortName =
          volume.Name.length > 30
            ? volume.Name.substring(0, 27) + "..."
            : volume.Name;

        return (
          <Box key={volume.Name}>
            <Box width="30%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                bold={isSelected}
              >
                {isSelected ? "> " : "  "}
                {shortName}
              </Text>
            </Box>
            <Box width="20%">
              <Text color={isSelected ? colors.highlight : colors.text}>
                {volume.Driver}
              </Text>
            </Box>
            <Box width="50%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                wrap="truncate-middle"
              >
                {volume.Mountpoint}
              </Text>
            </Box>
          </Box>
        );
      })}
      <Box marginTop={1} justifyContent="space-between">
        <Box>
          <Text color={colors.textSecondary}>
            Showing {offset + 1}-{Math.min(offset + LIMIT, volumes.length)} of{" "}
            {volumes.length}
          </Text>
        </Box>
        <Box>
          {actionMessage && <Text color={colors.success}>{actionMessage}</Text>}
          {actionError && <Text color={colors.error}>{actionError}</Text>}
          {!actionMessage && !actionError && (
            <Text color={colors.textSecondary}>Press 'x' to remove volume</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VolumeList;
