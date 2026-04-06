import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key tidak dikonfigurasi" },
        { status: 500 },
      );
    }

    const prompt = `Kamu adalah asisten keuangan. Analisis struk/nota belanja ini dan ekstrak informasi berikut.
Kembalikan HANYA JSON valid tanpa markdown, tanpa backtick, tanpa penjelasan apapun.

Format JSON yang harus dikembalikan:
{
  "amount": <total belanja dalam angka, tanpa titik/koma, contoh: 45000>,
  "merchant": "<nama toko/merchant>",
  "date": "<tanggal dalam format YYYY-MM-DD, jika tidak ada gunakan null>",
  "category": "<salah satu dari: makan, transport, belanja, hiburan, kesehatan, pendidikan, tagihan, lainnya>",
  "notes": "<deskripsi singkat isi struk, maks 50 karakter>"
}

Jika gambar bukan struk atau tidak bisa dibaca, kembalikan:
{ "error": "Bukan struk yang valid" }`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini error:", errBody);
      return NextResponse.json(
        { error: "Gagal memproses gambar" },
        { status: 500 },
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Gagal parse JSON Gemini:", rawText);
      return NextResponse.json(
        { error: "Gagal membaca hasil scan" },
        { status: 500 },
      );
    }

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json({
      amount: String(parsed.amount || "0"),
      merchant: parsed.merchant || "",
      date: parsed.date || new Date().toISOString().split("T")[0],
      category: parsed.category || "lainnya",
      notes: parsed.notes || "",
    });
  } catch (err) {
    console.error("scan-receipt error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
