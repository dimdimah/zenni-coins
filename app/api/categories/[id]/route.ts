// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();
    const { name, color, type } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    // Build update payload — only send fields that exist
    const updateData: Record<string, string> = {};
    if (name)  updateData.name  = name.trim();
    if (color) updateData.color = color;
    if (type)  updateData.type  = type;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/categories] Supabase error:", JSON.stringify(error));
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Kategori dengan id '${id}' tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[PATCH /api/categories] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Try to check if category is in use — skip if column doesn't exist
    try {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (count && count > 0) {
        return NextResponse.json(
          { error: `Kategori ini digunakan ${count} transaksi. Pindahkan transaksi terlebih dahulu.` },
          { status: 409 }
        );
      }
    } catch {
      // column category_id doesn't exist — proceed with delete
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[DELETE /api/categories] Supabase error:", JSON.stringify(error));
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/categories] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}