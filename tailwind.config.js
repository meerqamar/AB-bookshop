/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#047857", // Emerald 700
        "on-primary": "#ffffff",
        "primary-container": "#d1fae5", // Emerald 100
        "on-primary-container": "#064e3b", // Emerald 900
        "primary-fixed": "#a7f3d0",
        "primary-fixed-dim": "#6ee7b7",
        "on-primary-fixed": "#022c22",
        "on-primary-fixed-variant": "#065f46",
        
        "secondary": "#0f766e", // Teal 700
        "on-secondary": "#ffffff",
        "secondary-container": "#ccfbf1", // Teal 100
        "on-secondary-container": "#115e59", // Teal 800
        "secondary-fixed": "#99f6e4",
        "secondary-fixed-dim": "#5eead4",
        "on-secondary-fixed": "#042f2e",
        "on-secondary-fixed-variant": "#0f766e",
        
        "tertiary": "#4d7c0f", // Lime 700
        "on-tertiary": "#ffffff",
        "tertiary-container": "#ecfccb", // Lime 100
        "on-tertiary-container": "#3f6212", // Lime 800
        "tertiary-fixed": "#d9f99d",
        "tertiary-fixed-dim": "#bef264",
        "on-tertiary-fixed": "#1a2e05",
        "on-tertiary-fixed-variant": "#3f6212",
        
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        
        "background": "#f8fafc",
        "on-background": "#0f172a",
        "surface": "#f8fafc",
        "on-surface": "#0f172a",
        "surface-variant": "#e2e8f0",
        "on-surface-variant": "#475569",
        "outline": "#94a3b8",
        "outline-variant": "#cbd5e1",
        
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f5f9",
        "surface-container": "#e2e8f0",
        "surface-container-high": "#cbd5e1",
        "surface-container-highest": "#94a3b8",
        
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#34d399",
        "surface-tint": "#047857",
        "surface-dim": "#cbd5e1",
        "surface-bright": "#f8fafc"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "md": "24px",
        "xl": "80px",
        "gutter": "24px",
        "lg": "48px",
        "base": "8px",
        "xs": "4px",
        "sm": "12px",
        "container-max": "1280px"
      },
      fontFamily: {
        "body-lg": ["Atkinson Hyperlegible Next", "sans-serif"],
        "caption": ["Atkinson Hyperlegible Next", "sans-serif"],
        "display-lg": ["\"Source Serif 4\"", "serif"],
        "headline-sm": ["\"Source Serif 4\"", "serif"],
        "label-md": ["Atkinson Hyperlegible Next", "sans-serif"],
        "body-md": ["Atkinson Hyperlegible Next", "sans-serif"],
        "headline-md": ["\"Source Serif 4\"", "serif"],
        "display-lg-mobile": ["\"Source Serif 4\"", "serif"]
      },
      fontSize: {
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "caption": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-sm": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-md": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
        "display-lg-mobile": ["32px", {"lineHeight": "40px", "fontWeight": "700"}]
      }
    },
  },
  plugins: [],
}
