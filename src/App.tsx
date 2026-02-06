import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import Header from "./components/Header";
import ContainerList from "./components/ContainerList";
import ContainerDetails from "./components/ContainerDetails";
import ContainerLogs from "./components/ContainerLogs";
import ImageList from "./components/ImageList";
import VolumeList from "./components/VolumeList";
import NetworkList from "./components/NetworkList";
import { useDockerContainers } from "./hooks/useDockerContainers";
import { useDockerImages } from "./hooks/useDockerImages";
import { useDockerVolumes } from "./hooks/useDockerVolumes";
import { useDockerNetworks } from "./hooks/useDockerNetworks";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

type MainView = "containers" | "images" | "volumes" | "networks";
type DetailView = "list" | "details" | "logs";

const AppContent = () => {
  const { colors, toggleTheme, mode } = useTheme();
  // Containers State
  const {
    containers,
    isLoading: loadingContainers,
    error: containerError,
  } = useDockerContainers();
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null,
  );

  // Images State
  const {
    images,
    isLoading: loadingImages,
    error: imageError,
    refreshImages,
  } = useDockerImages();

  // Volumes State
  const {
    volumes,
    isLoading: loadingVolumes,
    error: volumeError,
    refreshVolumes,
  } = useDockerVolumes();

  // Networks State
  const {
    networks,
    isLoading: loadingNetworks,
    error: networkError,
    refreshNetworks,
  } = useDockerNetworks();

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainView>("containers");
  const [view, setView] = useState<DetailView>("list"); // Only applies when activeTab === 'containers'

  useInput((input, key) => {
    // Tab switching
    if (key.tab && view === "list") {
      // Cycle tabs
      setActiveTab((prev) => {
        if (prev === "containers") return "images";
        if (prev === "images") return "volumes";
        if (prev === "volumes") return "networks";
        return "containers";
      });
    }
    if (view === "list") {
      // Shortcuts to switch tabs
      if (input === "1") setActiveTab("containers");
      if (input === "2") setActiveTab("images");
      if (input === "3") setActiveTab("volumes");
      if (input === "4") setActiveTab("networks");

      // Theme Toggle
      if (input === "t") toggleTheme();
    }
  });

  const handleSelectContainer = (id: string) => {
    setSelectedContainerId(id);
    setView("details");
  };

  const handleViewLogs = (id: string) => {
    setSelectedContainerId(id);
    setView("logs");
  };

  const handleBack = () => {
    if (view === "logs") {
      setView("details");
    } else {
      setView("list");
      setSelectedContainerId(null);
    }
  };

  return (
    <Box flexDirection="column" padding={1} height="100%">
      <Header />

      {/* Tab Navigation */}
      <Box flexDirection="row" marginBottom={1}>
        <Box
          borderStyle={activeTab === "containers" ? "double" : "single"}
          borderColor={
            activeTab === "containers" ? colors.success : colors.tabBorder
          }
          paddingX={2}
          marginRight={1}
        >
          <Text
            bold={activeTab === "containers"}
            color={activeTab === "containers" ? colors.success : colors.tabText}
          >
            [1] Containers
          </Text>
        </Box>
        <Box
          borderStyle={activeTab === "images" ? "double" : "single"}
          borderColor={
            activeTab === "images" ? colors.highlight : colors.tabBorder
          }
          paddingX={2}
          marginRight={1}
        >
          <Text
            bold={activeTab === "images"}
            color={activeTab === "images" ? colors.highlight : colors.tabText}
          >
            [2] Images
          </Text>
        </Box>
        <Box
          borderStyle={activeTab === "volumes" ? "double" : "single"}
          borderColor={activeTab === "volumes" ? "magenta" : colors.tabBorder}
          paddingX={2}
          marginRight={1}
        >
          <Text
            bold={activeTab === "volumes"}
            color={activeTab === "volumes" ? "magenta" : colors.tabText}
          >
            [3] Volumes
          </Text>
        </Box>
        <Box
          borderStyle={activeTab === "networks" ? "double" : "single"}
          borderColor={activeTab === "networks" ? "cyan" : colors.tabBorder}
          paddingX={2}
        >
          <Text
            bold={activeTab === "networks"}
            color={activeTab === "networks" ? "cyan" : colors.tabText}
          >
            [4] Networks
          </Text>
        </Box>
        <Box marginLeft={2} padding={1}>
          <Text color={colors.textSecondary}>Theme: {mode} (t)</Text>
        </Box>
      </Box>

      {/* Error Handling */}
      {(containerError || imageError || volumeError || networkError) && (
        <Box
          borderStyle="single"
          borderColor={colors.error}
          padding={1}
          marginBottom={1}
        >
          <Text color={colors.error}>
            Error:{" "}
            {containerError?.message ||
              imageError?.message ||
              volumeError?.message ||
              networkError?.message}
          </Text>
        </Box>
      )}

      {/* Main Content Area */}
      {activeTab === "containers" ? (
        <>
          {loadingContainers && !containers.length ? (
            <Text>Loading containers...</Text>
          ) : (
            <>
              {view === "list" && (
                <ContainerList
                  containers={containers}
                  onSelect={handleSelectContainer}
                />
              )}
              {view === "details" && selectedContainerId && (
                <ContainerDetails
                  containerId={selectedContainerId}
                  onBack={handleBack}
                  onViewLogs={handleViewLogs}
                />
              )}
              {view === "logs" && selectedContainerId && (
                <ContainerLogs
                  containerId={selectedContainerId}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </>
      ) : activeTab === "images" ? (
        /* IMAGES TAB */
        <>
          {loadingImages && !images.length ? (
            <Text>Loading images...</Text>
          ) : (
            <ImageList images={images} onRefresh={refreshImages} />
          )}
        </>
      ) : activeTab === "volumes" ? (
        /* VOLUMES TAB */
        <>
          {loadingVolumes && !volumes.length ? (
            <Text>Loading volumes...</Text>
          ) : (
            <VolumeList volumes={volumes} onRefresh={refreshVolumes} />
          )}
        </>
      ) : (
        /* NETWORKS TAB */
        <>
          {loadingNetworks && !networks.length ? (
            <Text>Loading networks...</Text>
          ) : (
            <NetworkList networks={networks} onRefresh={refreshNetworks} />
          )}
        </>
      )}
    </Box>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
