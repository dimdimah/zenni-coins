"use client";

import { createContext, useContext, useState } from "react";

interface TransactionFormContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TransactionFormContext = createContext<TransactionFormContextType>({
  open: false,
  setOpen: () => {},
});

export function TransactionFormProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <TransactionFormContext.Provider value={{ open, setOpen }}>
      {children}
    </TransactionFormContext.Provider>
  );
}

export function useTransactionForm() {
  return useContext(TransactionFormContext);
}