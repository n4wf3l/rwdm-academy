import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InvoicesTableProps {
  invoices: any[];
  loading: boolean;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, loading }) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1) On trie par date décroissante
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const da = a.invoiceDate ? new Date(a.invoiceDate) : new Date(0);
      const db = b.invoiceDate ? new Date(b.invoiceDate) : new Date(0);
      return db.getTime() - da.getTime();
    });
  }, [invoices]);

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  // 2) Puis on paginate
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle>Liste des Factures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date de Facture</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead>Montant Payé</TableHead>
                <TableHead>Équipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length > 0
                ? paginatedInvoices.map((invoice, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>{invoice.invoiceNumber || "—"}</TableCell>
                      <TableCell>
                        {invoice.memberBasicDto?.fullName || "—"}
                      </TableCell>
                      <TableCell>
                        {invoice.totalAmount ? invoice.totalAmount + " €" : "—"}
                      </TableCell>
                      <TableCell>
                        {invoice.paidAmount ? invoice.paidAmount + " €" : "—"}
                      </TableCell>
                      <TableCell>{invoice.revenueItemName || "—"}</TableCell>
                    </TableRow>
                  ))
                : !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune facture ne correspond aux critères sélectionnés
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesTable;
