import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react()
  ],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{spec,test}.?(m|c)ts?(x)"],
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
