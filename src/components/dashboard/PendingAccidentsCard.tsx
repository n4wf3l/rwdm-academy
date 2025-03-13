
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye, Send } from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";

interface PendingAccidentsCardProps {
  pendingAccidents: Request[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (request: Request) => void;
  onSendToFederation: (requestId: string) => void;
}

const PendingAccidentsCard: React.FC<PendingAccidentsCardProps> = ({
  pendingAccidents,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
  onSendToFederation
}) => {
  // Don't render the card if there are no pending accidents
  if (pendingAccidents.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Déclarations d'accident en attente ({pendingAccidents.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAccidents.map((request) => (
                <TableRow 
                  key={request.id} 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                  onClick={() => onViewDetails(request)}
                >
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.date.toLocaleDateString('fr-BE')}</TableCell>
                  <TableCell>
                    {request.details && 'clubName' in request.details ? request.details.clubName : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToFederation(request.id);
                        }}
                      >
                        <Send className="h-4 w-4" />
                        <span>Envoyer à l'Union Belge</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {pendingAccidents.length > 5 && (
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

export default PendingAccidentsCard;
