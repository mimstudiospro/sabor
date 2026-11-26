import { describe, expect, it } from "vitest";
import { parseHash } from "../lib/routes";

describe("parseHash", () => {
  it("routes home, review, sign-in, and the editor", () => {
    expect(parseHash("#/")).toEqual({ view: "home" });
    expect(parseHash("")).toEqual({ view: "home" });
    expect(parseHash("#/review/cafe-ole")).toEqual({ view: "review", slug: "cafe-ole" });
    expect(parseHash("#/signin")).toEqual({ view: "signin" });
    expect(parseHash("#/write")).toEqual({ view: "write" });
    expect(parseHash("#/write/00000000-0000-4000-8000-000000000000")).toEqual({
      view: "write-edit",
      id: "00000000-0000-4000-8000-000000000000",
    });
  });

  it("falls back to home for unknown routes", () => {
    expect(parseHash("#/nope")).toEqual({ view: "home" });
    expect(parseHash("#/review/")).toEqual({ view: "home" });
  });
});
