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
import ViewProfile from "@/components/members/ViewProfile";
import { useTranslation } from "@/hooks/useTranslation";

interface Member {
  id: number; // Changed id to number for compatibility with ViewProfile
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
  currentUserRole: string;
  currentUserId: string; // Ajouter cette prop
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onEdit,
  onDelete,
  currentUserRole,
  currentUserId, // Ajoutez-le ici aussi
}) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const { t } = useTranslation();
  const paginatedMembers = members.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            {t("members_registered")} ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table_header_avatar")}</TableHead>
                  <TableHead>{t("table_header_full_name")}</TableHead>
                  <TableHead>{t("table_header_email")}</TableHead>
                  <TableHead>{t("table_header_function")}</TableHead>
                  <TableHead>{t("table_header_role")}</TableHead>
                  <TableHead>{t("table_header_created_at")}</TableHead>
                  {(currentUserRole === "owner" ||
                    currentUserRole === "superadmin") && (
                    <TableHead>{t("table_header_actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowProfileModal(true);
                      }}
                    >
                      <TableCell>
                        <img
                          src={member.profilePicture || "/avatar.jpg"}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (
                              target.src !==
                              window.location.origin + "/avatar.jpg"
                            ) {
                              target.src = "/avatar.jpg";
                            }
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
                      {(currentUserRole === "owner" ||
                        (currentUserRole === "superadmin" &&
                          member.role !== "owner")) && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {/* Le bouton Edit est visible pour: 
                                1. Les owners et superadmins (comme avant)
                                2. Les admins sur leur propre profil */}
                            {(currentUserRole === "owner" ||
                              currentUserRole === "superadmin" ||
                              (currentUserRole === "admin" &&
                                String(member.id) ===
                                  String(currentUserId))) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEdit(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Le bouton Delete est visible uniquement pour: 
                                1. Les owners (sur tous les profils sauf le leur)
                                2. Les superadmins (uniquement sur les profils qui ne sont pas owner ni eux-mêmes) */}
                            {((currentUserRole === "owner" &&
                              String(member.id) !== String(currentUserId)) ||
                              (currentUserRole === "superadmin" &&
                                member.role !== "owner" &&
                                String(member.id) !==
                                  String(currentUserId))) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onDelete(member)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {t("no_member_found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 mt-4">
              <div className="text-sm text-gray-600">{t("page_info")}</div>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">{t("previous")}</span>
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">{t("next")}</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <ViewProfile
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={selectedMember}
        />
      )}
    </>
  );
};

export default MemberList;
