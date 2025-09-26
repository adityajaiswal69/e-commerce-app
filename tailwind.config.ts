import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Brand Color System
        primary: {
          dark: "#333333",      // Main dark color for text, backgrounds, and accents
          DEFAULT: "#333333",   // Default primary color
        },
        secondary: {
          dark: "#555555",      // Secondary text and hover states
          DEFAULT: "#555555",   // Default secondary color
        },

        // Text Colors
        text: {
          primary: "#333333",   // Main headings and important text
          secondary: "#555555", // Body text and descriptions
          tertiary: "#666666",  // Supporting text and captions
        },

        // Background Colors
        bg: {
          light: "#F0F0F0",     // Light background start
          'light-end': "#DCDCDC", // Light background end (for gradients)
          dark: "#333333",      // Dark sections and hero areas
          white: "#FFFFFF",     // Cards and content areas
          accent: "#e9e9e6",    // Light accent for buttons and highlights
        },

        // Status Colors (keeping existing functionality)
        status: {
          pending: "#FEF3C7",     // bg-yellow-100
          'pending-text': "#92400E", // text-yellow-800
          confirmed: "#DBEAFE",    // bg-blue-100
          'confirmed-text': "#1E40AF", // text-blue-800
          processing: "#E9D5FF",   // bg-purple-100
          'processing-text': "#6B21A8", // text-purple-800
          shipped: "#C7D2FE",      // bg-indigo-100
          'shipped-text': "#3730A3", // text-indigo-800
          delivered: "#D1FAE5",    // bg-green-100
          'delivered-text': "#065F46", // text-green-800
          cancelled: "#FEE2E2",    // bg-red-100
          'cancelled-text': "#991B1B", // text-red-800
          refunded: "#F3E8FF",     // bg-purple-100
          'refunded-text': "#6B21A8", // text-purple-800
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
