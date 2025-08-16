import { GoogleGenerativeAI } from "@google/generative-ai";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

// Using Google Gemini for free AI processing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ExtractedInvoiceData {
  supplierName?: string;
  supplierGst?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  items: Array<{
    name: string;
    hsn?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number;
    taxAmount?: number;
  }>;
}

export class DocumentProcessor {
  async processInvoiceFile(filePath: string): Promise<ExtractedInvoiceData> {
    try {
      // First, extract text using OCR
      const extractedText = await this.extractTextFromFile(filePath);
      
      // Then use OpenAI to structure the data
      const structuredData = await this.extractInvoiceDataWithAI(extractedText);
      
      return structuredData;
    } catch (error) {
      console.error("Error processing invoice file:", error);
      throw new Error(`Failed to process invoice: ${error.message}`);
    }
  }

  private async extractTextFromFile(filePath: string): Promise<string> {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(fileExtension)) {
      // Process image files with OCR
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m)
      });
      return text;
    } else if (fileExtension === '.pdf') {
      // For PDFs, we'll use OpenAI's vision model
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const response = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: "application/pdf",
          },
        },
        "Extract all text from this invoice document. Focus on supplier details, invoice number, date, items list, quantities, prices, and tax information.",
      ]);

      return response.response.text() || "";
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  private async extractInvoiceDataWithAI(text: string): Promise<ExtractedInvoiceData> {
    const prompt = `
You are an expert at extracting structured data from Indian GST invoices. 
Extract the following information from this invoice text and return it as JSON:

1. Supplier information (name, GST number if available)
2. Invoice number and date
3. Total amount, subtotal, tax amount, and tax rate
4. List of items with:
   - Product name
   - HSN/SAC code if available
   - Quantity and unit
   - Unit price and total price
   - Tax rate and tax amount if available

Please be careful with number parsing and currency conversion (remove ₹ symbol and commas).
For dates, use YYYY-MM-DD format.

Invoice text:
${text}

Return the data in this JSON format:
{
  "supplierName": "string",
  "supplierGst": "string",
  "invoiceNumber": "string", 
  "invoiceDate": "YYYY-MM-DD",
  "totalAmount": number,
  "subtotal": number,
  "taxAmount": number,
  "taxRate": number,
  "items": [
    {
      "name": "string",
      "hsn": "string",
      "quantity": number,
      "unit": "string",
      "unitPrice": number,
      "totalPrice": number,
      "taxRate": number,
      "taxAmount": number
    }
  ]
}
`;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const response = await model.generateContent(prompt);
      const extractedData = JSON.parse(response.response.text() || "{}");
      
      // Validate and clean the extracted data
      return this.validateAndCleanData(extractedData);
    } catch (error) {
      console.error("Error extracting data with AI:", error);
      throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private validateAndCleanData(data: any): ExtractedInvoiceData {
    // Basic validation and cleaning
    const cleanedData: ExtractedInvoiceData = {
      supplierName: data.supplierName || undefined,
      supplierGst: data.supplierGst || undefined,
      invoiceNumber: data.invoiceNumber || undefined,
      invoiceDate: this.parseDate(data.invoiceDate),
      totalAmount: this.parseNumber(data.totalAmount),
      subtotal: this.parseNumber(data.subtotal),
      taxAmount: this.parseNumber(data.taxAmount),
      taxRate: this.parseNumber(data.taxRate),
      items: [],
    };

    // Clean items array
    if (Array.isArray(data.items)) {
      cleanedData.items = data.items.map((item: any) => ({
        name: item.name || "Unknown Item",
        hsn: item.hsn || undefined,
        quantity: this.parseNumber(item.quantity) || 1,
        unit: item.unit || "pcs",
        unitPrice: this.parseNumber(item.unitPrice) || 0,
        totalPrice: this.parseNumber(item.totalPrice) || 0,
        taxRate: this.parseNumber(item.taxRate),
        taxAmount: this.parseNumber(item.taxAmount),
      })).filter(item => item.name && item.name !== "Unknown Item");
    }

    return cleanedData;
  }

  private parseNumber(value: any): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols, commas, and spaces
      const cleanValue = value.replace(/[₹,\s]/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private parseDate(dateStr: any): string | undefined {
    if (!dateStr) return undefined;
    
    try {
      // Try to parse various date formats common in Indian invoices
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try parsing DD-MM-YYYY or DD/MM/YYYY format
        const parts = dateStr.toString().split(/[-\/]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
          const year = parseInt(parts[2]);
          
          if (year > 1900 && month >= 0 && month < 12 && day > 0 && day <= 31) {
            return new Date(year, month, day).toISOString().split('T')[0];
          }
        }
        return undefined;
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return undefined;
    }
  }

  async analyzeSupplierPerformance(supplierId: string, salesData: any[]): Promise<any> {
    try {
      const prompt = `
Analyze the supplier performance based on the following data and provide insights:

Supplier Data: ${JSON.stringify(salesData)}

Provide analysis on:
1. Delivery reliability
2. Price competitiveness 
3. Product quality trends
4. Payment terms adherence
5. Recommendations for negotiation

Return insights as JSON with scores (1-10) and detailed recommendations.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a business analyst expert in supplier relationship management and procurement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error analyzing supplier performance:", error);
      throw new Error(`Supplier analysis failed: ${error.message}`);
    }
  }

  async generateDemandForecast(historicalData: any[]): Promise<any> {
    try {
      const prompt = `
Based on the following historical sales data, generate demand forecasts for the next 30 days:

Historical Data: ${JSON.stringify(historicalData)}

Consider:
1. Seasonal trends
2. Day-of-week patterns  
3. Growth trends
4. External factors (holidays, events)

Return forecasts as JSON with daily predictions, confidence intervals, and key insights.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a data scientist expert in retail demand forecasting and inventory optimization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error generating demand forecast:", error);
      throw new Error(`Demand forecast failed: ${error.message}`);
    }
  }
}

export const documentProcessor = new DocumentProcessor();
