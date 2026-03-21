/**
 * Sync with root `package.json` field `"version"` (see CHANGELOG / GARDE-026).
 * Exposed in `ScenarioResult.meta` for API consumers (GARDE-026).
 */
import pkg from "../package.json" with { type: "json" };

export const ENGINE_VERSION: string =
  typeof pkg === "object" &&
  pkg !== null &&
  "version" in pkg &&
  typeof (pkg as { version: unknown }).version === "string"
    ? (pkg as { version: string }).version
    : "0.0.0";
