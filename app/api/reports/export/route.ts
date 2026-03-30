import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatShortDate } from "@/lib/utils/formatting";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const month = searchParams.get("month");

    // Get transactions
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(name)
      `
      )
      .eq("user_id", user.id);

    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );
      query = query
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());
    }

    const { data: transactions, error } = await query.order("date", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (format === "csv") {
      // Generate CSV
      const headers = ["Tanggal", "Kategori", "Tipe", "Jumlah", "Deskripsi"];
      const rows = transactions.map((tx: any) => [
        formatShortDate(tx.date),
        tx.category?.name || "Unknown",
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        tx.amount,
        tx.description || "",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" && cell.includes(",")
                ? `"${cell}"`
                : cell
            )
            .join(",")
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="laporan-keuangan-${month || "semua"}.csv"`,
        },
      });
    } else if (format === "json") {
      // Generate JSON
      const json = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          month: month || "all",
          totalRecords: transactions.length,
          transactions: transactions.map((tx: any) => ({
            date: tx.date,
            category: tx.category?.name || "Unknown",
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
          })),
        },
        null,
        2
      );

      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="laporan-keuangan-${month || "semua"}.json"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid format" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
