import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import RestoreMemberModal from "@/components/members/RestoreMemberModal";
import { Badge } from "../ui/badge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface OldMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  deletedAt: string;
  assignmentsCount: number;
}

const OldMemberList: React.FC = () => {
  const [oldMembers, setOldMembers] = useState<OldMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(oldMembers.length / itemsPerPage);
  const { t } = useTranslation();
  // États pour la modal de restauration
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedRestoreMember, setSelectedRestoreMember] =
    useState<OldMember | null>(null);

  // États pour la modal de suppression définitive
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteMember, setSelectedDeleteMember] =
    useState<OldMember | null>(null);

  const fetchOldMembers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/deleted-admins", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOldMembers(data);
      } else {
        console.error(
          "Erreur lors de la récupération des anciens membres:",
          data
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des anciens membres:",
        error
      );
    }
  };

  useEffect(() => {
    fetchOldMembers();
  }, []);

  const paginatedMembers = oldMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const restoreMember = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admins/restore/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Compte réactivé",
          description: "Le compte a été réactivé avec succès.",
        });
        window.location.reload();
      } else {
        console.error("Erreur lors de la réactivation du compte:", data);
      }
    } catch (error) {
      console.error("Erreur lors de la réactivation du compte:", error);
    }
  };

  const permanentlyDeleteMember = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admins/permanent/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Membre supprimé définitivement",
          description: "Le membre a été supprimé définitivement.",
        });
        window.location.reload();
      } else {
        console.error("Erreur lors de la suppression définitive:", data);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression définitive:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          {t("old_members")} ({oldMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table_header_id")}</TableHead>
                <TableHead>{t("table_header_full_name")}</TableHead>
                <TableHead>{t("table_header_email")}</TableHead>
                <TableHead>{t("table_header_role")}</TableHead>
                <TableHead>{t("table_header_assignments")}</TableHead>
                <TableHead>{t("table_header_deleted_at")}</TableHead>
                <TableHead>{t("table_header_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>{member.id}</TableCell>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
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
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.assignmentsCount}</TableCell>
                    <TableCell>
                      {member.deletedAt &&
                      !isNaN(new Date(member.deletedAt).getTime())
                        ? format(
                            new Date(member.deletedAt),
                            "dd MMMM yyyy à HH:mm",
                            { locale: fr }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRestoreMember(member);
                            setRestoreModalOpen(true);
                          }}
                        >
                          {t("button.restore_member")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedDeleteMember(member);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noOldMembers")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 mt-4">
            <div className="text-sm text-gray-600">
              {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {selectedRestoreMember && (
        <RestoreMemberModal
          isOpen={restoreModalOpen}
          member={selectedRestoreMember}
          onClose={() => setRestoreModalOpen(false)}
          onConfirm={() => {
            restoreMember(selectedRestoreMember.id);
            setRestoreModalOpen(false);
          }}
        />
      )}
      {selectedDeleteMember && (
        <ConfirmationDialog
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => {
            permanentlyDeleteMember(selectedDeleteMember.id);
            setDeleteModalOpen(false);
          }}
          title={t("deleteMemberTitle")}
          message={t("deleteMemberMessage")}
        />
      )}
    </Card>
  );
};

export default OldMemberList;
