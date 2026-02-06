import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Docker from "dockerode";
import { useImageActions } from "../hooks/useImageActions";
import { useTheme } from "../contexts/ThemeContext";

interface ImageListProps {
  images: Docker.ImageInfo[];
  onRefresh: () => void;
}

const LIMIT = 10;

const ImageList: React.FC<ImageListProps> = ({ images, onRefresh }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const { removeImage, isLoading, actionError, actionMessage } =
    useImageActions();
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
        const newIndex = Math.min(images.length - 1, prev + 1);
        if (newIndex >= offset + LIMIT) {
          setOffset(newIndex - LIMIT + 1);
        }
        return newIndex;
      });
    }
    // TODO: Actions for images (Run? Delete?)

    // Actions
    if (input === "x" || key.delete) {
      if (images[selectedIndex]) {
        const success = await removeImage(images[selectedIndex].Id);
        if (success) {
          onRefresh(); // Refresh list to remove deleted item
        }
      }
    }
  });

  // Handle list changes
  React.useEffect(() => {
    if (selectedIndex >= images.length && images.length > 0) {
      setSelectedIndex(Math.max(0, images.length - 1));
    }
  }, [images.length]);

  if (images.length === 0) {
    return (
      <Box borderStyle="round" borderColor={colors.warning} padding={1}>
        <Text color={colors.warning}>No images found.</Text>
      </Box>
    );
  }

  const visibleImages = images.slice(offset, offset + LIMIT);

  function formatSize(size: number) {
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Box marginBottom={1}>
        <Box width="25%">
          <Text underline color={colors.textSecondary}>
            ID
          </Text>
        </Box>
        <Box width="45%">
          <Text underline color={colors.textSecondary}>
            Repository/Tag
          </Text>
        </Box>
        <Box width="15%">
          <Text underline color={colors.textSecondary}>
            Size
          </Text>
        </Box>
        <Box width="15%">
          <Text underline color={colors.textSecondary}>
            Created
          </Text>
        </Box>
      </Box>
      {visibleImages.map((image, index) => {
        const actualIndex = offset + index;
        const isSelected = actualIndex === selectedIndex;
        const repoTag = image.RepoTags ? image.RepoTags[0] : "<none>";
        // Clean ID (sha256:...)
        const shortId = image.Id.replace("sha256:", "").substring(0, 12);

        return (
          <Box key={image.Id}>
            <Box width="25%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                bold={isSelected}
              >
                {isSelected ? "> " : "  "}
                {shortId}
              </Text>
            </Box>
            <Box width="45%">
              <Text
                color={isSelected ? colors.highlight : colors.text}
                wrap="truncate-end"
              >
                {repoTag}
              </Text>
            </Box>
            <Box width="15%">
              <Text color={colors.text}>{formatSize(image.Size)}</Text>
            </Box>
            <Box width="15%">
              <Text color={colors.text}>{formatTime(image.Created)}</Text>
            </Box>
          </Box>
        );
      })}
      <Box marginTop={1} justifyContent="space-between">
        <Box>
          <Text color={colors.textSecondary}>
            Showing {offset + 1}-{Math.min(offset + LIMIT, images.length)} of{" "}
            {images.length}
          </Text>
        </Box>
        <Box>
          {isLoading ? (
            <Text color={colors.warning}>Deleting...</Text>
          ) : (
            <>
              {actionMessage && (
                <Text color={colors.success}>{actionMessage}</Text>
              )}
              {actionError && <Text color={colors.error}>{actionError}</Text>}
              {!actionMessage && !actionError && (
                <Text color={colors.textSecondary}>
                  Press 'x' to remove image
                </Text>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageList;
