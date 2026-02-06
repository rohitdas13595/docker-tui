import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Docker from "dockerode";
import { useTheme } from "../contexts/ThemeContext";

interface ContainerListProps {
  containers: Docker.ContainerInfo[];
  onSelect: (containerId: string) => void;
}

const LIMIT = 10;

const ContainerList: React.FC<ContainerListProps> = ({
  containers,
  onSelect,
}) => {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter containers based on search query
  const filteredContainers = React.useMemo(() => {
    if (!searchQuery) return containers;
    const lowerQuery = searchQuery.toLowerCase();
    return containers.filter(
      (c) =>
        c.Names[0]?.toLowerCase().includes(lowerQuery) ||
        c.Id.toLowerCase().includes(lowerQuery) ||
        c.Image.toLowerCase().includes(lowerQuery),
    );
  }, [containers, searchQuery]);

  // Adjust selection and offset if filtered list changes
  React.useEffect(() => {
    if (filteredContainers.length === 0) {
      setSelectedIndex(0);
      setOffset(0);
      return;
    }

    // Ensure selected index is valid
    if (selectedIndex >= filteredContainers.length) {
      setSelectedIndex(filteredContainers.length - 1);
    }

    // Ensure offset is valid for the new list size
    // If the list shrank significantly, we might need to reduce offset
    if (offset >= filteredContainers.length) {
      setOffset(Math.max(0, filteredContainers.length - LIMIT));
    }
  }, [filteredContainers.length, selectedIndex, offset]);

  useInput((input, key) => {
    if (isSearching) {
      if (key.return) {
        setIsSearching(false);
        return;
      }
      if (key.escape) {
        setIsSearching(false);
        setSearchQuery(""); // Optional: clear on escape? Standard is usually clear.
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery((prev) => prev.slice(0, -1));
        return;
      }
      // Add characters to search query
      if (input && input.length === 1 && !key.ctrl && !key.meta) {
        setSearchQuery((prev) => prev + input);
      }
      return;
    }

    // Navigation Mode
    if (input === "/" && !isSearching) {
      setIsSearching(true);
      return;
    }

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
        const newIndex = Math.min(filteredContainers.length - 1, prev + 1);
        if (newIndex >= offset + LIMIT) {
          setOffset(newIndex - LIMIT + 1);
        }
        return newIndex;
      });
    }
    if (key.return) {
      if (filteredContainers[selectedIndex]) {
        onSelect(filteredContainers[selectedIndex].Id);
      }
    }
  });

  const visibleContainers = filteredContainers.slice(offset, offset + LIMIT);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isSearching ? colors.borderSelected : colors.border}
      padding={1}
    >
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Box width="15%">
            <Text underline color={colors.textSecondary}>
              ID
            </Text>
          </Box>
          <Box width="25%">
            <Text underline color={colors.textSecondary}>
              Name
            </Text>
          </Box>
          <Box width="25%">
            <Text underline color={colors.textSecondary}>
              Image
            </Text>
          </Box>
          <Box width="15%">
            <Text underline color={colors.textSecondary}>
              State
            </Text>
          </Box>
          <Box width="20%">
            <Text underline color={colors.textSecondary}>
              Status
            </Text>
          </Box>
        </Box>
      </Box>

      {visibleContainers.length === 0 ? (
        <Box padding={1}>
          <Text color={colors.warning}>
            No containers match "{searchQuery}"
          </Text>
        </Box>
      ) : (
        visibleContainers.map((container, index) => {
          const actualIndex = offset + index;
          const isSelected = actualIndex === selectedIndex;
          const stateColor = container.State === "running" ? "green" : "red";
          const name = container.Names[0]?.replace("/", "") || "Unknown";

          return (
            <Box key={container.Id}>
              <Box width="15%">
                <Text
                  color={isSelected ? colors.highlight : colors.text}
                  bold={isSelected}
                >
                  {isSelected ? "> " : "  "}
                  {container.Id.substring(0, 8)}
                </Text>
              </Box>
              <Box width="25%">
                <Text
                  color={isSelected ? colors.highlight : colors.text}
                  bold={isSelected}
                >
                  {name}
                </Text>
              </Box>
              <Box width="25%">
                <Text
                  color={isSelected ? colors.highlight : colors.text}
                  wrap="truncate-end"
                >
                  {container.Image}
                </Text>
              </Box>
              <Box width="15%">
                <Text color={stateColor}>{container.State}</Text>
              </Box>
              <Box width="20%">
                <Text color={colors.text} wrap="truncate-end">
                  {container.Status}
                </Text>
              </Box>
            </Box>
          );
        })
      )}

      <Box marginTop={1} justifyContent="space-between">
        <Box>
          <Text color={colors.textSecondary}>
            Showing {filteredContainers.length > 0 ? offset + 1 : 0}-
            {Math.min(offset + LIMIT, filteredContainers.length)} of{" "}
            {filteredContainers.length}
          </Text>
        </Box>
        <Box>
          {isSearching ? (
            <Text>
              Search:{" "}
              <Text color={colors.borderSelected} bold>
                {searchQuery}_
              </Text>
            </Text>
          ) : (
            <Text color={colors.textSecondary}>
              {searchQuery
                ? `Filter: ${searchQuery} (press / to edit, Esc clear)`
                : "Press '/' to search"}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContainerList;
