import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Docker from "dockerode";

interface ContainerListProps {
  containers: Docker.ContainerInfo[];
  onSelect: (containerId: string) => void;
}

const LIMIT = 10;

const ContainerList: React.FC<ContainerListProps> = ({
  containers,
  onSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  // Handle list changes (e.g. items removed)
  React.useEffect(() => {
    if (selectedIndex >= containers.length && containers.length > 0) {
      const newIndex = Math.max(0, containers.length - 1);
      setSelectedIndex(newIndex);
      // Adjust offset if needed
      if (newIndex < offset) {
        setOffset(newIndex);
      }
    }
  }, [containers.length, selectedIndex, offset]);

  useInput((input, key) => {
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
        const newIndex = Math.min(containers.length - 1, prev + 1);
        if (newIndex >= offset + LIMIT) {
          setOffset(newIndex - LIMIT + 1);
        }
        return newIndex;
      });
    }
    if (key.return) {
      if (containers[selectedIndex]) {
        onSelect(containers[selectedIndex].Id);
      }
    }
  });

  if (containers.length === 0) {
    return (
      <Box borderStyle="round" borderColor="yellow" padding={1}>
        <Text color="yellow">No containers found.</Text>
      </Box>
    );
  }

  const visibleContainers = containers.slice(offset, offset + LIMIT);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Box marginBottom={1}>
        <Box width="15%">
          <Text underline color="gray">
            ID
          </Text>
        </Box>
        <Box width="25%">
          <Text underline color="gray">
            Name
          </Text>
        </Box>
        <Box width="25%">
          <Text underline color="gray">
            Image
          </Text>
        </Box>
        <Box width="15%">
          <Text underline color="gray">
            State
          </Text>
        </Box>
        <Box width="20%">
          <Text underline color="gray">
            Status
          </Text>
        </Box>
      </Box>
      {visibleContainers.map((container, index) => {
        const actualIndex = offset + index;
        const isSelected = actualIndex === selectedIndex;
        const stateColor = container.State === "running" ? "green" : "red";
        const name = container.Names[0]?.replace("/", "") || "Unknown";

        return (
          <Box key={container.Id}>
            <Box width="15%">
              <Text color={isSelected ? "blue" : "white"} bold={isSelected}>
                {isSelected ? "> " : "  "}
                {container.Id.substring(0, 8)}
              </Text>
            </Box>
            <Box width="25%">
              <Text color={isSelected ? "blue" : "white"} bold={isSelected}>
                {name}
              </Text>
            </Box>
            <Box width="25%">
              <Text color={isSelected ? "blue" : "white"} wrap="truncate-end">
                {container.Image}
              </Text>
            </Box>
            <Box width="15%">
              <Text color={stateColor}>{container.State}</Text>
            </Box>
            <Box width="20%">
              <Text wrap="truncate-end">{container.Status}</Text>
            </Box>
          </Box>
        );
      })}
      <Box marginTop={1} justifyContent="center">
        <Text color="gray">
          Showing {offset + 1}-{Math.min(offset + LIMIT, containers.length)} of{" "}
          {containers.length}
        </Text>
      </Box>
    </Box>
  );
};

export default ContainerList;
