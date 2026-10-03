import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { paper: "#f4f5ef", ink: "#20231f", campus: "#b9f36b", coral: "#f1785c" } } },
  plugins: [],
};
export default config;
