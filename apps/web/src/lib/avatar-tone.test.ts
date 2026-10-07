import { describe, expect, it } from "vitest";

import { AVATAR_TONES, avatarTone } from "@WorkSphere/ui/lib/avatar-tone";

describe("avatarTone", () => {
  it("returns the same tone for the same key", () => {
    expect(avatarTone("Priya Sharma")).toBe(avatarTone("Priya Sharma"));
  });

  it.each(["", "a", "😀 Emoji", "李小龙", "x".repeat(500)])(
    "always returns a palette tone for %j",
    (key) => {
      expect(AVATAR_TONES).toContain(avatarTone(key));
    },
  );

  it("spreads a sample of names across at least 5 tones", () => {
    const names = [
      "Priya Sharma", "Rahul Verma", "Anita Desai", "John Smith", "Mita Rao",
      "Arjun Mehta", "Sara Khan", "Vikram Singh", "Neha Gupta", "Omar Ali",
      "Kavya Iyer", "Liam Brown",
    ];
    expect(new Set(names.map(avatarTone)).size).toBeGreaterThanOrEqual(5);
  });
});
