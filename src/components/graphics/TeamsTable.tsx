import React, { useState } from "react";
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

interface TeamsTableProps {
  teams: any[];
  loading: boolean;
}

const TeamsTable: React.FC<TeamsTableProps> = ({ teams, loading }) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(teams.length / itemsPerPage);

  const paginatedTeams = teams.slice(
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
        <CardTitle>Liste des équipes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Chargement des équipes...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Genre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeams.length > 0 ? (
                    paginatedTeams.map((team, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{team.id || "—"}</TableCell>
                        <TableCell>{team.name || "—"}</TableCell>
                        <TableCell>{team.age || "—"}</TableCell>
                        <TableCell>{team.level || "—"}</TableCell>
                        <TableCell>{team.gender || "—"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Aucune équipe disponible
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamsTable;
