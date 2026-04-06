// lib/utils/exportPDF.ts
// Client-side PDF generator — dipanggil langsung dari browser
// npm install jspdf jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction } from "@/lib/types";

function formatRupiah(val: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(val));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildSummary(transactions: Transaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    const cat = (tx as any).category?.name || "Unknown";
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

export function exportPDFClient(transactions: Transaction[], month: string, monthLabel: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const amber = [245, 166, 35] as [number, number, number];
  const dark  = [15, 23, 42]  as [number, number, number];
  const pageW = doc.internal.pageSize.getWidth();
  const summary = buildSummary(transactions);

  // ── header banner ──
  doc.setFillColor(...amber);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Keuangan", 14, 16);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${monthLabel}`, 14, 23);
  doc.text(
    `Diekspor: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    14, 29,
  );

  // ── summary cards ──
  const cardY = 44;
  const cardW = (pageW - 28 - 8) / 3;
  const cards = [
    {
      label: "Total Pemasukan",
      value: formatRupiah(summary.totalIncome),
      color: [209, 250, 229] as [number, number, number],
      text: [6, 95, 70] as [number, number, number],
    },
    {
      label: "Total Pengeluaran",
      value: formatRupiah(summary.totalExpense),
      color: [254, 243, 199] as [number, number, number],
      text: [120, 53, 15] as [number, number, number],
    },
    {
      label: "Saldo",
      value: formatRupiah(summary.balance),
      color: summary.balance >= 0
        ? ([209, 250, 229] as [number, number, number])
        : ([254, 226, 226] as [number, number, number]),
      text: summary.balance >= 0
        ? ([6, 95, 70] as [number, number, number])
        : ([153, 27, 27] as [number, number, number]),
    },
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

  // ── breakdown per kategori ──
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

  // ── detail transaksi ──
  const afterBreakdown = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("Detail Transaksi", 14, afterBreakdown);

  autoTable(doc, {
    startY: afterBreakdown + 4,
    head: [["Tanggal", "Kategori", "Tipe", "Jumlah", "Deskripsi"]],
    body: transactions.map((tx: any) => [
      formatDate(tx.date),
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

  // ── footer halaman ──
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

  doc.save(`laporan-keuangan-${month || "semua"}.pdf`);
}