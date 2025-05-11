import React from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, RotateCcw, FileText, Settings } from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";

type Props = {
  documents: any[];
  formatRequestId: (id: string | number) => string;
  translateDocumentType: (type: string) => string;
  onViewDetails: (doc: any) => void;
  onEditRequest: (doc: Request) => void;
  onRevertRequest: (id: string) => void;
  onGeneratePDF: (doc: Request) => void;
};

const DocumentsTable = ({
  documents,
  formatRequestId,
  translateDocumentType,
  onViewDetails,
  onEditRequest,
  onRevertRequest,
  onGeneratePDF,
}: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[
            "ID",
            "Type",
            "Nom",
            "Email",
            "Téléphone",
            "Status",
            "Assigné à",
            "Date",
            "Actions",
          ].map((header, index) => (
            <motion.th
              key={header}
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {header}
            </motion.th>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.tr
              key={doc.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onViewDetails(doc)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              exit={{ opacity: 0 }}
              layout
            >
              <TableCell>{formatRequestId(doc.id)}</TableCell>
              <TableCell>
                {translateDocumentType(doc.type)}
                {doc.type === "accident-report" &&
                  doc.data?.documentLabel === "Déclaration d'accident" &&
                  " (1/2)"}
                {doc.type === "accident-report" &&
                  doc.data?.documentLabel === "Certificat de guérison" &&
                  " (2/2)"}
              </TableCell>
              <TableCell>
                {doc.name} {doc.surname}
              </TableCell>
              <TableCell>{doc.email}</TableCell>
              <TableCell>{doc.phone}</TableCell>
              <TableCell>
                <span className="bg-green-500 text-white py-1 px-2 rounded">
                  {doc.status}
                </span>
              </TableCell>
              <TableCell>{doc.assignedAdmin}</TableCell>
              <TableCell>
                {doc.createdAt
                  ? new Date(doc.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" title="Actions">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-100">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(doc);
                      }}
                    >
                      <Eye className="h-5 w-5 text-gray-600 mr-2" /> Voir
                      détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRequest(doc);
                      }}
                    >
                      <Pencil className="h-5 w-5 text-gray-600 mr-2" /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevertRequest(doc.id);
                      }}
                    >
                      <RotateCcw className="h-5 w-5 text-gray-600 mr-2" />{" "}
                      Mettre en cours
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePDF(doc);
                      }}
                    >
                      <FileText className="h-5 w-5 text-gray-600 mr-2" />{" "}
                      Générer PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
};

export default DocumentsTable;
