import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("returns the fallback when raw is null, undefined, or empty", () => {
    expect(safeRedirectPath(null, "/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath(undefined, "/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("", "/dashboard")).toBe("/dashboard");
  });

  it("allows a same-origin relative path", () => {
    expect(safeRedirectPath("/finance/transactions", "/dashboard")).toBe(
      "/finance/transactions"
    );
  });

  it("rejects an absolute URL to another origin", () => {
    expect(safeRedirectPath("https://evil.example", "/dashboard")).toBe(
      "/dashboard"
    );
    expect(safeRedirectPath("http://evil.example/path", "/dashboard")).toBe(
      "/dashboard"
    );
  });

  it("rejects a protocol-relative URL (//evil.example)", () => {
    expect(safeRedirectPath("//evil.example", "/dashboard")).toBe("/dashboard");
  });

  it("rejects a backslash variant used to smuggle a protocol-relative URL (/\\evil.example)", () => {
    expect(safeRedirectPath("/\\evil.example", "/dashboard")).toBe(
      "/dashboard"
    );
  });

  it("rejects a path that doesn't start with a slash", () => {
    expect(safeRedirectPath("evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("javascript:alert(1)", "/dashboard")).toBe(
      "/dashboard"
    );
  });

  it("preserves query strings and fragments on an otherwise-safe path", () => {
    expect(safeRedirectPath("/finance?tab=budgets#top", "/dashboard")).toBe(
      "/finance?tab=budgets#top"
    );
  });
});
