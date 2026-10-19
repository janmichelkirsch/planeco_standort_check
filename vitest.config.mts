import { defineConfig } from "vitest/config";

// Unit-Tests für reine Logik in lib/ (keine React-Komponenten, daher Umgebung "node").
export default defineConfig({
  // `@/…`-Importe wie in tsconfig.json
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
