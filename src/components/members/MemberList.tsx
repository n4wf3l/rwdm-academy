import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  function: string;
  role: string;
  createdAt: string;
}

interface MemberListProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onEdit,
  onDelete,
}) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(members.length / itemsPerPage);

  const paginatedMembers = members.slice(
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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Membres inscrits ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fonction</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <img
                        src={member.profilePicture}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://via.placeholder.com/150";
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.function || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "owner"
                            ? "default"
                            : member.role === "superadmin"
                            ? "secondary"
                            : member.role === "admin"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {typeof member.role === "string"
                          ? member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)
                          : "—"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {member.createdAt &&
                      !isNaN(new Date(member.createdAt).getTime())
                        ? format(
                            new Date(member.createdAt),
                            "dd MMMM yyyy à HH:mm",
                            {
                              locale: fr,
                            }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(member)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucun membre trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 mt-4">
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

export default MemberList;
