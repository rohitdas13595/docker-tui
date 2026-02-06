import React from "react";
import { Box } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";

const Header = () => (
  <Box flexDirection="column" alignItems="center" marginBottom={1}>
    <Gradient name="morning">
      <BigText text="Docker TUI" />
    </Gradient>
  </Box>
);

export default Header;
