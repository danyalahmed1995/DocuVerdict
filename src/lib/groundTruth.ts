import type { GroundTruthIssue, GroundTruthResult } from "@/lib/types";

const NUMBER_TOLERANCE = 0.01;
const SKIPPED_RESULT: GroundTruthResult = {
  enabled: false,
  matchPercentage: null,
  matchedFields: 0,
  mismatchedFields: 0,
  missingFields: 0,
  extraFields: 0,
  issues: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function isEmptyLike(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function createIssue(
  type: GroundTruthIssue["type"],
  path: string,
  message: string,
  expected?: unknown,
  actual?: unknown,
): GroundTruthIssue {
  const severity = type === "match" || type === "extra" ? "info" : "critical";
  return { path, severity, type, expected, actual, message };
}

function valuesMatch(expected: unknown, actual: unknown): boolean {
  if (isEmptyLike(expected) && isEmptyLike(actual)) return true;

  if (typeof expected === "number" && typeof actual === "number") {
    return Math.abs(expected - actual) <= NUMBER_TOLERANCE;
  }

  if (typeof expected === "string" && typeof actual === "string") {
    return expected === actual || normalizeString(expected) === normalizeString(actual);
  }

  return Object.is(expected, actual);
}

function valueLabel(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value.trim() === "" ? "empty string" : `"${value}"`;
  return JSON.stringify(value);
}

function compareNode(expected: unknown, actual: unknown, path: string, issues: GroundTruthIssue[]): void {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      issues.push(createIssue("mismatch", path, "Expected an array.", expected, actual));
      return;
    }

    expected.forEach((expectedItem, index) => {
      const itemPath = `${path}[${index}]`;
      if (index >= actual.length) {
        issues.push(createIssue("missing", itemPath, "Field is missing from extracted JSON.", expectedItem));
      } else {
        compareNode(expectedItem, actual[index], itemPath, issues);
      }
    });

    actual.forEach((actualItem, index) => {
      if (index >= expected.length) {
        issues.push(createIssue("extra", `${path}[${index}]`, "Field is extra in extracted JSON.", undefined, actualItem));
      }
    });
    return;
  }

  if (isRecord(expected)) {
    if (!isRecord(actual)) {
      issues.push(createIssue("mismatch", path, "Expected an object.", expected, actual));
      return;
    }

    for (const key of Object.keys(expected)) {
      const childPath = path === "$" ? key : `${path}.${key}`;
      if (!(key in actual)) {
        issues.push(createIssue("missing", childPath, "Field is missing from extracted JSON.", expected[key]));
      } else {
        compareNode(expected[key], actual[key], childPath, issues);
      }
    }

    for (const key of Object.keys(actual)) {
      if (!(key in expected)) {
        const childPath = path === "$" ? key : `${path}.${key}`;
        issues.push(createIssue("extra", childPath, "Field is extra in extracted JSON.", undefined, actual[key]));
      }
    }
    return;
  }

  if (valuesMatch(expected, actual)) {
    issues.push(createIssue("match", path, "Field matches expected JSON.", expected, actual));
    return;
  }

  const type = actual === undefined ? "missing" : "mismatch";
  issues.push(
    createIssue(
      type,
      path,
      `Expected ${valueLabel(expected)}, got ${valueLabel(actual)}.`,
      expected,
      actual,
    ),
  );
}

export function getSkippedGroundTruthResult(): GroundTruthResult {
  return SKIPPED_RESULT;
}

export function selectExpectedJsonForFile(expectedJson: unknown, pdfFileName: string): unknown {
  if (isRecord(expectedJson) && pdfFileName in expectedJson) {
    return expectedJson[pdfFileName];
  }

  return expectedJson;
}

export function compareGroundTruth(extractedJson: unknown, expectedJson: unknown): GroundTruthResult {
  const issues: GroundTruthIssue[] = [];
  compareNode(expectedJson, extractedJson, "$", issues);

  const matchedFields = issues.filter((item) => item.type === "match").length;
  const mismatchedFields = issues.filter((item) => item.type === "mismatch").length;
  const missingFields = issues.filter((item) => item.type === "missing").length;
  const extraFields = issues.filter((item) => item.type === "extra").length;
  const sourceTruthFields = matchedFields + mismatchedFields + missingFields;
  const matchPercentage =
    sourceTruthFields === 0 ? 100 : Math.round((matchedFields / sourceTruthFields) * 100);

  return {
    enabled: true,
    matchPercentage,
    matchedFields,
    mismatchedFields,
    missingFields,
    extraFields,
    issues,
  };
}
