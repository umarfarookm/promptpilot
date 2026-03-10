import type { Config } from "tailwindcss";

/**
 * Shared Tailwind CSS preset for PromptPilot applications.
 *
 * Usage in an app's tailwind.config.ts:
 *   import promptpilotPreset from "@promptpilot/ui/tailwind.config";
 *   export default { presets: [promptpilotPreset], ... } satisfies Config;
 */
const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        "promptpilot-primary": {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        "promptpilot-dark": {
          50: "#f5f5f6",
          100: "#e5e6e8",
          200: "#cfd0d4",
          300: "#adafb5",
          400: "#84868f",
          500: "#696b74",
          600: "#5a5b63",
          700: "#4c4d53",
          800: "#434348",
          900: "#28282b",
          950: "#121214",
        },
        "promptpilot-accent": {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
    },
  },
  plugins: [],
};

export default preset;
