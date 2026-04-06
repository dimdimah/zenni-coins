import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatShortDate } from "@/lib/utils/formatting";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatRupiah(val: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(val));
}

function buildSummary(transactions: any[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    const cat = tx.category?.name || "Unknown";

    if (!byCategory[cat]) byCategory[cat] = { income: 0, expense: 0 };

    if (tx.type === "income") {
      totalIncome += amount;
      byCategory[cat].income += amount;
    } else {
      totalExpense += amount;
      byCategory[cat].expense += amount;
    }
  }

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, byCategory };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const month = searchParams.get("month");

    let query = supabase
      .from("transactions")
      .select("*, category:categories(name)")
      .eq("user_id", user.id);

    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query = query.gte("date", startDate.toISOString()).lte("date", endDate.toISOString());
    }

    const { data: transactions, error } = await query.order("date", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const filename = `laporan-keuangan-${month || "semua"}`;
    const summary = buildSummary(transactions);

    if (format === "csv") {
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
          row.map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
          ).join(",")
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    if (format === "json") {
      const json = JSON.stringify({
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
      }, null, 2);

      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }

    if (format === "excel") {
      const wb = XLSX.utils.book_new();

      const summaryRows = [
        ["LAPORAN KEUANGAN", ""],
        ["Periode", month || "Semua"],
        ["Tanggal Export", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
        ["", ""],
        ["RINGKASAN", ""],
        ["Total Pemasukan", summary.totalIncome],
        ["Total Pengeluaran", summary.totalExpense],
        ["Saldo", summary.balance],
        ["", ""],
        ["BREAKDOWN PER KATEGORI", ""],
        ["Kategori", "Pemasukan", "Pengeluaran", "Net"],
        ...Object.entries(summary.byCategory).map(([cat, val]) => [
          cat,
          val.income,
          val.expense,
          val.income - val.expense,
        ]),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

      wsSummary["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

      const txHeaders = ["Tanggal", "Kategori", "Tipe", "Jumlah", "Deskripsi"];
      const txRows = transactions.map((tx: any) => [
        formatShortDate(tx.date),
        tx.category?.name || "Unknown",
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        Number(tx.amount),
        tx.description || "-",
      ]);
      const wsDetail = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
      wsDetail["!cols"] = [{ wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Transaksi");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    if (format === "pdf-server") {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const amber = [245, 166, 35] as [number, number, number];
      const dark  = [15, 23, 42]  as [number, number, number];
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(...amber);
      doc.rect(0, 0, pageW, 38, "F");

      doc.setTextColor(...dark);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Keuangan", 14, 16);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${month || "Semua"}`, 14, 23);
      doc.text(
        `Diekspor: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        14,
        29,
      );

      const cardY = 44;
      const cardW = (pageW - 28 - 8) / 3;
      const cards = [
        { label: "Total Pemasukan", value: formatRupiah(summary.totalIncome), color: [209, 250, 229] as [number, number, number], text: [6, 95, 70] as [number, number, number] },
        { label: "Total Pengeluaran", value: formatRupiah(summary.totalExpense), color: [254, 243, 199] as [number, number, number], text: [120, 53, 15] as [number, number, number] },
        { label: "Saldo", value: formatRupiah(summary.balance), color: summary.balance >= 0 ? ([209, 250, 229] as [number, number, number]) : ([254, 226, 226] as [number, number, number]), text: summary.balance >= 0 ? ([6, 95, 70] as [number, number, number]) : ([153, 27, 27] as [number, number, number]) },
      ];
      cards.forEach((card, i) => {
        const x = 14 + i * (cardW + 4);
        doc.setFillColor(...card.color);
        doc.roundedRect(x, cardY, cardW, 20, 3, 3, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...card.text);
        doc.text(card.label, x + 4, cardY + 7);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(card.value, x + 4, cardY + 15);
      });

      const breakdownY = cardY + 28;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("Breakdown per Kategori", 14, breakdownY);

      autoTable(doc, {
        startY: breakdownY + 4,
        head: [["Kategori", "Pemasukan", "Pengeluaran", "Net"]],
        body: Object.entries(summary.byCategory).map(([cat, val]) => [
          cat,
          formatRupiah(val.income),
          formatRupiah(val.expense),
          formatRupiah(val.income - val.expense),
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: amber, textColor: dark, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [255, 251, 235] },
        margin: { left: 14, right: 14 },
      });

      const afterBreakdown = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("Detail Transaksi", 14, afterBreakdown);

      autoTable(doc, {
        startY: afterBreakdown + 4,
        head: [["Tanggal", "Kategori", "Tipe", "Jumlah", "Deskripsi"]],
        body: transactions.map((tx: any) => [
          formatShortDate(tx.date),
          tx.category?.name || "Unknown",
          tx.type === "income" ? "Pemasukan" : "Pengeluaran",
          formatRupiah(tx.amount),
          tx.description || "-",
        ]),
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        headStyles: { fillColor: dark, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [255, 251, 235] },
        columnStyles: { 4: { cellWidth: 40 } },
        margin: { left: 14, right: 14 },
      });

      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" },
        );
      }

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}