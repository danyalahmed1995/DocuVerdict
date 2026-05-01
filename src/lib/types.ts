export type Severity = "critical" | "warning" | "info";

export type QAIssue = {
  severity: Severity;
  path: string;
  message: string;
};

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Invoice = {
  invoice_number: string;
  vendor_name: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
};

export type QAReport = {
  score: number;
  grade: "Excellent" | "Good" | "Needs Review" | "Poor";
  documentFit: {
    status: "Looks like invoice" | "Possibly not invoice";
    warning: string | null;
  };
  issues: QAIssue[];
  missingFields: string[];
  unexpectedFields: string[];
  typeMismatches: string[];
  validationErrors: string[];
  mathInconsistencies: string[];
};

export type GroundTruthIssue = {
  path: string;
  severity: "critical" | "warning" | "info";
  type: "match" | "mismatch" | "missing" | "extra";
  expected?: unknown;
  actual?: unknown;
  message: string;
};

export type GroundTruthResult = {
  enabled: boolean;
  matchPercentage: number | null;
  matchedFields: number;
  mismatchedFields: number;
  missingFields: number;
  extraFields: number;
  issues: GroundTruthIssue[];
};

export type AnalyzeResponse = {
  extractedJson: unknown;
  report: QAReport;
  groundTruth: GroundTruthResult;
  sourceTextPreview: string;
};
