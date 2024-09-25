import { useEffect, useState } from "react";

export const usePreferredColorScheme = () => {
  const [preferredColorScheme, setPreferredColorScheme] = useState<
    "light" | "dark" | undefined
  >(undefined);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Set the initial value
    setPreferredColorScheme(mediaQuery.matches ? "dark" : "light");

    // Define a callback to handle media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPreferredColorScheme(event.matches ? "dark" : "light");
    };

    // Add the event listener
    mediaQuery.addEventListener("change", handleChange);

    // Clean up the event listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return preferredColorScheme as "light" | "dark";
};

export default usePreferredColorScheme;
