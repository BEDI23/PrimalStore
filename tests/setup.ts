import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Isolation : on démonte les composants rendus entre chaque test.
afterEach(() => {
  cleanup();
});
