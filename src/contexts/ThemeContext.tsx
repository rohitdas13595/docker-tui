import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface ThemeColors {
  text: string;
  textSecondary: string;
  border: string;
  borderSelected: string;
  highlight: string;
  error: string;
  success: string;
  warning: string;
  tabBorder: string;
  tabText: string;
}

interface ThemeContextType {
  mode: "dark" | "light";
  colors: ThemeColors;
  toggleTheme: () => void;
}

const darkColors: ThemeColors = {
  text: "white",
  textSecondary: "gray",
  border: "cyan",
  borderSelected: "green",
  highlight: "cyan",
  error: "red",
  success: "green",
  warning: "yellow",
  tabBorder: "gray",
  tabText: "gray",
};

const lightColors: ThemeColors = {
  text: "black", // Assumes light terminal background
  textSecondary: "gray",
  border: "blue",
  borderSelected: "magenta",
  highlight: "blue",
  error: "red",
  success: "green",
  warning: "yellow",
  tabBorder: "black",
  tabText: "black",
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  colors: darkColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const colors = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
