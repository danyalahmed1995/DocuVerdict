import {
  invoiceFieldTypes,
  invoiceLineItemFieldTypes,
  invoiceSchema,
} from "@/lib/invoiceSchema";
import type { QAReport, QAIssue, Severity } from "@/lib/types";

const CURRENCY_TOLERANCE = 0.05;
const DOCUMENT_FIT_WARNING =
  "This document does not appear to be an invoice. DocuVerdict MVP currently supports invoice PDFs only.";
const CORE_INVOICE_FIELDS = [
  "invoice_number",
  "vendor_name",
  "customer_name",
  "invoice_date",
  "due_date",
  "currency",
  "line_items",
  "total",
] as const;
const POSSIBLY_NOT_INVOICE_THRESHOLD = 6;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeName(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function issue(severity: Severity, path: string, message: string): QAIssue {
  return { severity, path, message };
}

function expectedTypeMatches(value: unknown, expected: string): boolean {
  if (expected === "array") return Array.isArray(value);
  return typeof value === expected;
}

function isEmptyWeakValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length === 0;
}

function isClose(left: number, right: number): boolean {
  return Math.abs(left - right) <= CURRENCY_TOLERANCE;
}

function gradeFor(score: number): QAReport["grade"] {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Review";
  return "Poor";
}

function isMissingInvoiceSignal(value: unknown): boolean {
  if (value === null || value === undefined || isEmptyWeakValue(value)) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function getDocumentFit(extracted: Record<string, unknown>): QAReport["documentFit"] {
  const missingCoreFields = CORE_INVOICE_FIELDS.filter((field) =>
    isMissingInvoiceSignal(extracted[field]),
  );

  if (missingCoreFields.length >= POSSIBLY_NOT_INVOICE_THRESHOLD) {
    return {
      status: "Possibly not invoice",
      warning: DOCUMENT_FIT_WARNING,
    };
  }

  return {
    status: "Looks like invoice",
    warning: null,
  };
}

export function validateAndScoreInvoice(extracted: unknown): QAReport {
  const issues: QAIssue[] = [];
  const missingFields: string[] = [];
  const unexpectedFields: string[] = [];
  const typeMismatches: string[] = [];
  const validationErrors: string[] = [];
  const mathInconsistencies: string[] = [];
  let penalty = 0;

  if (!isRecord(extracted)) {
    const message = "Model output must be a JSON object.";
    issues.push(issue("critical", "$", message));
    return {
      score: 0,
      grade: "Poor",
      documentFit: {
        status: "Possibly not invoice",
        warning: DOCUMENT_FIT_WARNING,
      },
      issues,
      missingFields: Object.keys(invoiceFieldTypes),
      unexpectedFields,
      typeMismatches: ["$"],
      validationErrors: [message],
      mathInconsistencies,
    };
  }

  for (const [field, expectedType] of Object.entries(invoiceFieldTypes)) {
    const value = extracted[field];

    if (!(field in extracted) || value === null || isEmptyWeakValue(value)) {
      missingFields.push(field);
      issues.push(issue("critical", field, `${field} is missing or empty.`));
      penalty += 12;
      continue;
    }

    if (!expectedTypeMatches(value, expectedType)) {
      typeMismatches.push(field);
      issues.push(
        issue(
          "critical",
          field,
          `${field} should be ${expectedType}, received ${typeName(value)}.`,
        ),
      );
      penalty += 10;
    }
  }

  for (const field of Object.keys(extracted)) {
    if (!(field in invoiceFieldTypes)) {
      unexpectedFields.push(field);
      issues.push(issue("info", field, `${field} is not part of the invoice schema.`));
      penalty += 2;
    }
  }

  const lineItems = extracted.line_items;
  if (Array.isArray(lineItems)) {
    if (lineItems.length === 0) {
      issues.push(issue("critical", "line_items", "line_items must contain at least one item."));
      missingFields.push("line_items");
      penalty += 12;
    }

    lineItems.forEach((item, index) => {
      const basePath = `line_items[${index}]`;
      if (!isRecord(item)) {
        typeMismatches.push(basePath);
        issues.push(issue("critical", basePath, "Line item must be an object."));
        penalty += 10;
        return;
      }

      for (const [field, expectedType] of Object.entries(invoiceLineItemFieldTypes)) {
        const path = `${basePath}.${field}`;
        const value = item[field];

        if (!(field in item) || value === null || isEmptyWeakValue(value)) {
          missingFields.push(path);
          issues.push(issue("critical", path, `${path} is missing or empty.`));
          penalty += 8;
          continue;
        }

        if (!expectedTypeMatches(value, expectedType)) {
          typeMismatches.push(path);
          issues.push(
            issue(
              "critical",
              path,
              `${path} should be ${expectedType}, received ${typeName(value)}.`,
            ),
          );
          penalty += 7;
        }
      }

      for (const field of Object.keys(item)) {
        if (!(field in invoiceLineItemFieldTypes)) {
          const path = `${basePath}.${field}`;
          unexpectedFields.push(path);
          issues.push(issue("info", path, `${path} is not part of the line item schema.`));
          penalty += 1;
        }
      }

      if (
        typeof item.quantity === "number" &&
        typeof item.unit_price === "number" &&
        typeof item.total === "number"
      ) {
        const expectedTotal = item.quantity * item.unit_price;
        if (!isClose(expectedTotal, item.total)) {
          const message = `${basePath}: quantity * unit_price (${expectedTotal.toFixed(
            2,
          )}) does not match total (${item.total.toFixed(2)}).`;
          mathInconsistencies.push(message);
          issues.push(issue("warning", basePath, message));
          penalty += 5;
        }
      }
    });
  }

  if (
    typeof extracted.subtotal === "number" &&
    typeof extracted.tax === "number" &&
    typeof extracted.total === "number"
  ) {
    const expectedTotal = extracted.subtotal + extracted.tax;
    if (!isClose(expectedTotal, extracted.total)) {
      const message = `subtotal + tax (${expectedTotal.toFixed(2)}) does not match total (${extracted.total.toFixed(2)}).`;
      mathInconsistencies.push(message);
      issues.push(issue("warning", "total", message));
      penalty += 8;
    }
  }

  const parsed = invoiceSchema.safeParse(extracted);
  if (!parsed.success) {
    for (const error of parsed.error.issues) {
      const path = error.path.length ? error.path.join(".") : "$";
      const message = `${path}: ${error.message}`;
      validationErrors.push(message);
    }
  }

  const score = Math.max(0, Math.round(100 - penalty));
  const documentFit = getDocumentFit(extracted);

  if (documentFit.warning) {
    issues.unshift(issue("warning", "document_type", documentFit.warning));
  }

  return {
    score,
    grade: gradeFor(score),
    documentFit,
    issues,
    missingFields: Array.from(new Set(missingFields)),
    unexpectedFields: Array.from(new Set(unexpectedFields)),
    typeMismatches: Array.from(new Set(typeMismatches)),
    validationErrors: Array.from(new Set(validationErrors)),
    mathInconsistencies,
  };
}
