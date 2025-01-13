import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./ui-src",
  plugins: [react(), viteSingleFile()],
  build: {
    target: "ES2017",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: "../dist",
    rollupOptions: {
      output: {},
    },
  },
  define: {
    SUPABASE_URL: JSON.stringify('https://vwqhreycgyfxhtwyohdm.supabase.co'),
    SUPABASE_ANON_KEY: JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWhyZXljZ3lmeGh0d3lvaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3ODI4NzIsImV4cCI6MjA1MjM1ODg3Mn0.FcVl0C5e-vDyGW3dmrAcPOmiqZT3OhTa9spyNvv6WZY'),
  }
});
