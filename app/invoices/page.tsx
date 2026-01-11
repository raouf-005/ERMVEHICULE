import { InvoicesList } from "@/src/features/invoices/InvoicesList";

/**
 * Invoices Page - Uses client-side SWR for optimistic updates and real-time sync
 * Benefits:
 * - Faster perceived performance (optimistic UI updates)
 * - Real-time synchronization across tabs/users
 * - Automatic background revalidation
 * - Better user experience with loading states
 */
export default function InvoicesListPage() {
  return <InvoicesList />;
}
