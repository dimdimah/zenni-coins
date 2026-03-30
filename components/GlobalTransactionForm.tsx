"use client";

import { useTransactionForm } from "@/lib/context/transaction-form-context";
import { TransactionForm } from "@/components/TransactionForm";

export function GlobalTransactionForm() {
  const { open, setOpen } = useTransactionForm();
  return <TransactionForm open={open} onOpenChange={setOpen} />;
}