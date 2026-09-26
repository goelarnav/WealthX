/** Recharts needs literal color strings (SVG fill/stroke), not Tailwind
 * classes — these are the same shades used as `teal-*`/`rose-*`/etc.
 * utility classes elsewhere, kept in one place so every calculator chart
 * stays visually consistent. */
export const CHART_COLORS = {
  tealDark: "#0f766e", // teal-700
  teal: "#0d9488", // teal-600
  tealLight: "#5eead4", // teal-300
  rose: "#e11d48", // rose-600
  amber: "#d97706", // amber-600
  slate: "#475569", // slate-600
  slateLight: "#cbd5e1", // slate-300
  grid: "#e2e8f0", // slate-200
  axis: "#94a3b8", // slate-400
};
