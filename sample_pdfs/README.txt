DocuVerdict sample PDFs

These are text-based/selectable invoice PDFs for testing the DocuVerdict MVP.

Files:
- sample_invoice_clean.pdf: should extract cleanly and score high.
- sample_invoice_missing_due_date.pdf: intentionally omits due_date so missing-field checks can trigger.
- sample_invoice_math_mismatch.pdf: intentionally contains inconsistent math so QA checks can trigger.
- expected_extractions.json: reference values for manual comparison.

How to test:
1. Open DocuVerdict at http://localhost:3000.
2. Upload one PDF.
3. Click Run Extraction QA.
4. Confirm the UI shows extracted JSON, QA score, grouped issues, and verdict.

No OCR is needed. You should be able to select/copy text from these PDFs.
