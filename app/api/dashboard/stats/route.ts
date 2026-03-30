import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getMonthRange } from "@/lib/utils/formatting";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ✅ 1. AUTH
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ 2. GET RANGE BULAN
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    const range = month
      ? {
          start: new Date(`${month}-01`),
          end: new Date(
            new Date(`${month}-01`).getFullYear(),
            new Date(`${month}-01`).getMonth() + 1,
            0,
          ),
        }
      : getMonthRange();

    const start = range.start.toISOString();
    const end = range.end.toISOString();

    // ✅ 3. CALL RPC (CORE LOGIC)
    const { data, error } = await supabase.rpc("get_dashboard_stats", {
      p_user_id: user.id,
      p_start: start,
      p_end: end,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data || {};

    // ✅ 4. RECENT TRANSACTIONS — filter by bulan yang dipilih
    const { data: recentTx, error: recentError } = await supabase
      .from("transactions")
      .select(
        `
        id,
        amount,
        type,
        date,
        category:categories(
          id,
          name,
          type,
          color,
          icon
        )
      `,
      )
      .eq("user_id", user.id)
      .gte("date", start) // ← filter mulai tanggal
      .lte("date", end) // ← filter sampai tanggal
      .order("date", { ascending: false })
      .limit(5);

    if (recentError) {
      return NextResponse.json({ error: recentError.message }, { status: 500 });
    }

    // ✅ 5. FINAL RESPONSE
    return NextResponse.json({
      totalIncome: result.totalIncome || 0,
      totalExpense: result.totalExpense || 0,
      balance: (result.totalIncome || 0) - (result.totalExpense || 0),
      categorySummary: result.categorySummary || [],
      recentTransactions: recentTx || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
