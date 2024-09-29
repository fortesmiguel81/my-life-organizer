import * as LucideIcons from "lucide-react";

type LucideIconComponent = React.ComponentType & { displayName?: string };

export function getFilteredIconDisplayNames(
  icons: typeof LucideIcons
): string[] {
  const iconKeys = Object.keys(icons) as Array<keyof typeof LucideIcons>;

  // Filter out keys that end with "Icon" or start with "Lucide"
  const filteredKeys = iconKeys
    .filter((key) => !key.endsWith("Icon"))
    .filter((key) => !key.startsWith("Lucide"));

  // Map the filtered keys to kebab case display names and remove duplicates
  const displayNames = Array.from(
    new Set(
      filteredKeys.map((key) => {
        const iconComponent = icons[key] as LucideIconComponent;
        // Use kebab-cased display name or fall back to the key
        return iconNameToKebabCase(iconComponent.displayName || key);
      })
    )
  );

  return displayNames;
}

export function iconNameToCamelCaseWithSpaces(input: string): string {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function iconNameToKebabCase(input?: string): string {
  if (!input) return "";
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function camelCaseWithSpacesToKebabCase(input: string): string {
  return input
    .replace(/\s+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
