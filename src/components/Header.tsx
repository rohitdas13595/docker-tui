import React from "react";
import { Box } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {
  const { mode } = useTheme();
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Gradient name={mode === "dark" ? "morning" : "retro"}>
        <BigText text="Docker TUI" />
      </Gradient>
    </Box>
  );
};

export default Header;
