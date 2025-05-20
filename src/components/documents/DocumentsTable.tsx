import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import {
  Root as DropdownMenuRoot,
  Trigger as DropdownMenuTrigger,
  Content as DropdownMenuContent,
  Item as DropdownMenuItem,
  Portal as DropdownMenuPortal,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, RotateCcw, FileText, Settings } from "lucide-react";
import { Request as ModalRequest } from "@/components/RequestDetailsModal";
import { useTranslation } from "@/hooks/useTranslation";
import { Checkbox } from "@/components/ui/checkbox";

type ModalRequestWithEmail = ModalRequest & { email: string };

type Props = {
  documents: ModalRequestWithEmail[];
  formatRequestId: (id: string | number) => string;
  onViewDetails: (doc: ModalRequestWithEmail) => void;
  onEditRequest: (doc: ModalRequestWithEmail) => void;
  onRevertRequest: (id: string) => void;
  onGeneratePDF: (doc: ModalRequestWithEmail) => void;
  archiveMode?: boolean;
  selectedDocuments?: Set<string>;
  onToggleSelection?: (id: string) => void;
};

const ITEMS_PER_PAGE = 10;

const DocumentsTable: React.FC<Props> = ({
  documents,
  formatRequestId,
  onViewDetails,
  onEditRequest,
  onRevertRequest,
  onGeneratePDF,
  archiveMode,
  selectedDocuments,
  onToggleSelection,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const paginatedDocs = documents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const { t } = useTranslation();
  const getTranslatedDocumentType = (type: string) => {
    switch (type) {
      case "registration":
        return t("request_type_registration");
      case "selection-tests":
        return t("request_type_selection_tests");
      case "accident-report":
        return t("request_type_accident_report");
      case "responsibility-waiver":
        return t("request_type_responsibility_waiver");
      default:
        return type;
    }
  };

  const headers = [
    "tableHeaderID",
    "tableHeaderType",
    "tableHeaderName",
    "tableHeaderEmail",
    "tableHeaderStatus",
    "tableHeaderAssignedTo",
    "tableHeaderDate",
    "tableHeaderActions",
  ] as const;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {archiveMode && (
              <motion.th
                className="px-4 py-2 text-left font-medium w-12"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
              >
                {t("select")}
              </motion.th>
            )}
            {headers.map((key, i) => (
              <motion.th
                key={key}
                className="px-4 py-2 text-left font-medium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {t(key)}
              </motion.th>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {paginatedDocs.map((doc, idx) => (
              <motion.tr
                key={doc.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  archiveMode ? "" : "cursor-pointer"
                } ${
                  selectedDocuments?.has(doc.id)
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                exit={{ opacity: 0 }}
                layout
                onClick={() => {
                  if (!archiveMode) {
                    console.log("Row clicked!", doc);
                    onViewDetails(doc);
                  }
                }}
              >
                {archiveMode && (
                  <TableCell className="w-12 border-r">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelection?.(doc.id);
                      }}
                    >
                      <Checkbox
                        checked={selectedDocuments?.has(doc.id)}
                        className="cursor-pointer"
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </TableCell>
                )}

                <TableCell className="cursor-pointer">
                  {formatRequestId(doc.id)}
                </TableCell>

                <TableCell className="cursor-pointer">
                  {getTranslatedDocumentType(doc.type)}
                  {doc.type === "accident-report" &&
                    doc.details.documentLabel === "Déclaration d'accident" &&
                    " (1/2)"}
                  {doc.type === "accident-report" &&
                    doc.details.documentLabel === "Certificat de guérison" &&
                    " (2/2)"}
                </TableCell>

                <TableCell className="cursor-pointer">{doc.name}</TableCell>

                <TableCell className="cursor-pointer">{doc.email}</TableCell>

                <TableCell className="cursor-pointer">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5">
                    {t("completed")}
                  </span>
                </TableCell>

                <TableCell className="cursor-pointer">
                  {doc.assignedTo}
                </TableCell>

                <TableCell className="cursor-pointer">
                  {doc.date ? new Date(doc.date).toLocaleDateString() : "N/A"}
                </TableCell>

                <TableCell>
                  <DropdownMenuRoot>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Actions"
                        className="data-[state=open]:bg-gray-200 data-[state=open]:text-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-56 bg-gray-100 shadow-md rounded-md py-2 cursor-pointer"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(doc);
                          }}
                          className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2"
                        >
                          <Eye className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-800">
                            {t("viewDetails")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRequest(doc);
                          }}
                          className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2"
                        >
                          <Pencil className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-800">
                            {t("edit")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onRevertRequest(doc.id);
                          }}
                          className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2"
                        >
                          <RotateCcw className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-800">
                            {t("setInProgress")}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onGeneratePDF(doc);
                          }}
                          className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2"
                        >
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-800">
                            {t("generatePDF")}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenuRoot>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            {t("previous")}
          </Button>
          <span className="text-sm text-gray-600">
            {t("page")}&nbsp;{currentPage}&nbsp;{t("of")}&nbsp;{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </>
  );
};

export default DocumentsTable;
