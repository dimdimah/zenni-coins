import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ReceiptData {
  storeName: string;
  totalAmount: number;
  currency: string;
  date: string;
  categoryId?: string;
  categoryName: string;
  description: string;
  items: Array<{ name: string; price: number }>;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "storeName": "name of the store",
  "totalAmount": numeric value of total amount,
  "currency": "currency code (e.g., IDR, USD)",
  "date": "transaction date in YYYY-MM-DD format (use current date if not visible)",
  "categoryName": "suggest appropriate category (e.g., Food & Beverage, Groceries, Transportation, Entertainment, Shopping, Utilities, Other)",
  "description": "brief description of the purchase",
  "items": [{ "name": "item name", "price": numeric price }],
  "confidence": confidence score 0-1
}

Rules:
1. Extract ONLY numeric values for prices/amounts
2. Be strict about accuracy - if you cannot read something, use null
3. Suggest the most appropriate category based on items purchased
4. If no clear date, use today's date
5. Currency should be auto-detected from context (default: IDR for Indonesian stores)
6. Return valid JSON only, no markdown or extra text`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: image.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        systemInstruction: 'You are an expert at reading receipts and extracting financial data. You must return valid JSON only.',
      },
    });

    const rawText = result.text ?? '';
    const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();

    let receiptData: ReceiptData;
    try {
      receiptData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse receipt data', raw: rawText },
        { status: 400 }
      );
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    const matchedCategory = categories?.find(
      (cat) =>
        cat.name.toLowerCase() === receiptData.categoryName.toLowerCase() ||
        cat.name.toLowerCase().includes(receiptData.categoryName.toLowerCase().split(' ')[0])
    );

    if (matchedCategory) receiptData.categoryId = matchedCategory.id;

    return NextResponse.json({ success: true, data: receiptData });
  } catch (error) {
    console.error('Receipt scan error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan receipt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}