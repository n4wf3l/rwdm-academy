
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";
import { translateRequestType, getStatusBadge } from './RequestsTable';

interface CompletedRequestsCardProps {
  completedRequests: Request[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (request: Request) => void;
}

const CompletedRequestsCard: React.FC<CompletedRequestsCardProps> = ({
  completedRequests,
  page,
  totalPages,
  onPageChange,
  onViewDetails
}) => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Demandes terminées ({completedRequests.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {completedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune demande terminée pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedRequests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                    onClick={() => onViewDetails(request)}
                  >
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{translateRequestType(request.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{request.name}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.date.toLocaleDateString('fr-BE')}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(request);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {completedRequests.length > 5 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedRequestsCard;
