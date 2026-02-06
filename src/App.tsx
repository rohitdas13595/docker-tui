import React, { useState } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import Header from "./components/Header";
import ContainerList from "./components/ContainerList";
import ContainerDetails from "./components/ContainerDetails";
import { useDockerContainers } from "./hooks/useDockerContainers";

const App = () => {
  const { containers, isLoading, error } = useDockerContainers();
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null,
  );

  const handleSelectContainer = (id: string) => {
    setSelectedContainerId(id);
    setView("details");
  };

  const handleBack = () => {
    setView("list");
    setSelectedContainerId(null);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      {error && (
        <Box
          borderStyle="single"
          borderColor="red"
          padding={1}
          marginBottom={1}
        >
          <Text color="red">Error: {error.message}</Text>
          <Text>
            Make sure Docker is running and you have permissions (e.g. sudo or
            docker group).
          </Text>
        </Box>
      )}

      {isLoading && !containers.length ? (
        <Text>
          <Text color="green">
            <Spinner type="dots" />
          </Text>{" "}
          Loading containers...
        </Text>
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
            />
          )}
        </>
      )}
    </Box>
  );
};

export default App;
