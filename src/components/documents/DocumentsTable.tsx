import React from "react";
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

type Props = {
  documents: ModalRequest[];
  formatRequestId: (id: string | number) => string;
  translateDocumentType: (type: string) => string;
  onViewDetails: (doc: ModalRequest) => void;
  onEditRequest: (doc: ModalRequest) => void;
  onRevertRequest: (id: string) => void;
  onGeneratePDF: (doc: ModalRequest) => void;
};

const DocumentsTable: React.FC<Props> = ({
  documents,
  formatRequestId,
  translateDocumentType,
  onViewDetails,
  onEditRequest,
  onRevertRequest,
  onGeneratePDF,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[
            "ID",
            "Type",
            "Nom",
            "Email",
            "Status",
            "Assigné à",
            "Date",
            "Actions",
          ].map((header, i) => (
            <motion.th
              key={header}
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {header}
            </motion.th>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        <AnimatePresence>
          {documents.map((doc, idx) => (
            <motion.tr
              key={doc.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              exit={{ opacity: 0 }}
              layout
            >
              {/* 1. ID */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {formatRequestId(doc.id)}
              </TableCell>

              {/* 2. Type */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {translateDocumentType(doc.type)}
                {doc.type === "accident-report" &&
                  doc.details.documentLabel === "Déclaration d'accident" &&
                  " (1/2)"}
                {doc.type === "accident-report" &&
                  doc.details.documentLabel === "Certificat de guérison" &&
                  " (2/2)"}
              </TableCell>

              {/* 3. Nom */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {doc.name}
              </TableCell>

              {/* 4. Email */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {doc.email}
              </TableCell>

              {/* 6. Status */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                <span className="inline-flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5">
                  Terminé
                </span>
              </TableCell>

              {/* 7. Assigné à */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {doc.assignedTo}
              </TableCell>

              {/* 8. Date */}
              <TableCell
                className="cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {doc.date ? new Date(doc.date).toLocaleDateString() : "N/A"}
              </TableCell>

              {/* 9. Actions */}
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
                      className="w-56 bg-gray-100 shadow-md rounded-md transition-all duration-200 ease-in-out py-2 cursor-pointer"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(doc);
                        }}
                        className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                      >
                        <Eye className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-800">
                          Voir détails
                        </span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRequest(doc);
                        }}
                        className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                      >
                        <Pencil className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-800">Modifier</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevertRequest(doc.id);
                        }}
                        className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                      >
                        <RotateCcw className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-800">
                          Mettre en cours
                        </span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onGeneratePDF(doc);
                        }}
                        className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                      >
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-800">
                          Générer PDF
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
  );
};

export default DocumentsTable;
