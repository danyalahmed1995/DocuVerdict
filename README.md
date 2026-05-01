# 🧠 DocuVerdict  
### AI Document Extraction QA & Evaluation Workbench

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![Groq](https://img.shields.io/badge/Groq-LLM-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚨 The Problem

LLMs can extract structured data from documents…  
But teams still don’t know:

- ❌ Is the extraction complete?
- ❌ Are the values correct?
- ❌ Are the numbers consistent?
- ❌ Can we trust this in production?

---

## ⚖️ The Solution

**DocuVerdict** is an AI-powered workbench that evaluates the reliability of LLM-based document extraction pipelines.

It doesn’t just extract data.

> **“Can you trust this output?”**

---

## 🔍 How It Works

```
PDF → LLM → JSON → QA Validation → Ground Truth Comparison → Final Verdict
```

---

## 🧩 Core Features

### 🧠 AI Extraction
- Extract structured JSON from text-based PDFs using Groq LLMs

### 🧪 QA Validation Engine
Detects:
- Missing required fields  
- Unexpected fields  
- Type mismatches  
- Empty / weak values  
- Math inconsistencies (e.g. totals don’t add up)

### 🎯 Ground Truth Comparison
Compare extracted output against expected JSON:
- Match percentage  
- Field-level differences  
- Missing / extra / mismatched fields  
- Nested comparison (line items supported)

### ⚠️ Document Type Detection
- Identifies if a document **does not match the expected schema**
- Prevents misleading QA results

### 📊 Scoring System
Each document gets:
- Score out of 100  
- Human-readable grade  
- Issue breakdown by severity  

### 📦 Export Report
Download a full analysis report including:
- Extracted JSON  
- QA results  
- Ground truth comparison  

---

## 🧠 Why This Matters

Most tools stop at:

```
PDF → JSON
```

DocuVerdict goes further:

```
JSON → Validate → Verify → Score → Explain
```

It detects:
- ❌ Bad AI output  
- ❌ Bad expected/training data  
- ❌ Business logic errors  

---

## 🖼️ Demo

### ✅ Clean Invoice
![Clean Invoice](./public/demo/clean.png)

### ⚠️ Missing Field
![Missing Field](./public/demo/missing.png)

### 🧮 Math Mismatch
![Math Issue](./public/demo/math.png)

### 🚫 Non-Invoice Detection
![Non Invoice](./public/demo/non-invoice.png)

---

## ⚙️ Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Node API Routes
- Zod (schema validation)
- pdf-parse + pdfjs-dist fallback
- Groq LLM API

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env` file:

```bash
GROQ_API_KEY=your_api_key_here
```

Optional:

```bash
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Run the app

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🧪 How to Test

1. Upload a sample invoice PDF  
2. Click **Run Extraction QA**  
3. (Optional) Upload `expected_extractions.json`  
4. View:
   - Extracted JSON  
   - QA Report  
   - Ground Truth Comparison  

---

## 📊 Example Output

```json
{
  "score": 87,
  "grade": "Good",
  "issues": [
    "Line item total mismatch",
    "Subtotal + tax mismatch"
  ],
  "groundTruth": {
    "matchPercentage": 100
  }
}
```

---

## 🧨 Key Insight

DocuVerdict can detect when:

```
AI output matches expected data
BUT the expected data itself is wrong
```

This is critical for real-world systems.

---

## 🗺️ Roadmap

- Custom schema support  
- Batch PDF evaluation  
- Multi-model comparison  
- CSV export  
- API-first mode  

---

## 📄 License

MIT License

---

## 💡 Positioning

> DocuVerdict is not a PDF parser.  
> It is a **trust layer for AI-generated structured data**.
