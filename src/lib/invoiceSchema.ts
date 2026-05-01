import { z } from "zod";

export const invoiceLineItemSchema = z
  .object({
    description: z.string().min(1),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
  })
  .strict();

export const invoiceSchema = z
  .object({
    invoice_number: z.string().min(1),
    vendor_name: z.string().min(1),
    customer_name: z.string().min(1),
    invoice_date: z.string().min(1),
    due_date: z.string().min(1),
    currency: z.string().min(1),
    line_items: z.array(invoiceLineItemSchema).min(1),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
  })
  .strict();

export const invoiceFieldTypes = {
  invoice_number: "string",
  vendor_name: "string",
  customer_name: "string",
  invoice_date: "string",
  due_date: "string",
  currency: "string",
  line_items: "array",
  subtotal: "number",
  tax: "number",
  total: "number",
} as const;

export const invoiceLineItemFieldTypes = {
  description: "string",
  quantity: "number",
  unit_price: "number",
  total: "number",
} as const;

export type InvoiceField = keyof typeof invoiceFieldTypes;
export type InvoiceLineItemField = keyof typeof invoiceLineItemFieldTypes;
