import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatNumber,
  formatRelativeDate,
  capitalizeFirstLetter,
} from "@/utils/format";

describe("formatNumber", () => {
  it("formats small numbers without commas", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(12345)).toBe("12,345");
    expect(formatNumber(999999)).toBe("999,999");
  });

  it("formats millions with commas", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(1234567890)).toBe("1,234,567,890");
  });
});

describe("formatRelativeDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than a minute ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:30Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("just now");
  });

  it("returns minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:05:00Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("5 minutes ago");
  });

  it("returns singular minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:01:30Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("1 minute ago");
  });

  it("returns hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T15:00:00Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("3 hours ago");
  });

  it("returns singular hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T13:00:00Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("1 hour ago");
  });

  it('returns "yesterday"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-16T12:00:00Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("yesterday");
  });

  it("returns days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-20T12:00:00Z"));
    expect(formatRelativeDate("2024-01-15T12:00:00Z")).toBe("5 days ago");
  });

  it("returns formatted date for older than 30 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
    const result = formatRelativeDate("2024-01-15T12:00:00Z");
    expect(result).toMatch(/^on /);
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes first letter and lowercases rest", () => {
    expect(capitalizeFirstLetter("public")).toBe("Public");
    expect(capitalizeFirstLetter("PRIVATE")).toBe("Private");
    expect(capitalizeFirstLetter("internal")).toBe("Internal");
  });

  it("handles single character", () => {
    expect(capitalizeFirstLetter("a")).toBe("A");
  });

  it("handles empty string", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});
