import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import MemberForm from "@/components/members/MemberForm";
import MemberList from "@/components/members/MemberList";
import EditMemberModal from "@/components/members/EditMemberModal";
import DeleteMemberModal from "@/components/members/DeleteMemberModal"; // Import de la modale de suppression

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  functionTitle: string;
  description: string;
  role: string;
}

const Members = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Récupérer les membres depuis le backend
  useEffect(() => {
    async function fetchMembers() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/admins", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMembers(data);
        } else {
          toast({
            title: "Erreur",
            description:
              data.message || "Erreur lors de la récupération des membres.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des membres:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la récupération des membres.",
          variant: "destructive",
        });
      }
    }
    fetchMembers();
  }, [toast]);

  const handleMemberCreated = (member: Member) => {
    setMembers((prev) => [...prev, member]);
  };

  // Fonction de suppression via le backend
  const deleteMemberFromBackend = async (member: Member) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admins/${member.email}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.email !== member.email));
        toast({
          title: "Membre supprimé",
          description: "Le membre a été supprimé avec succès.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Erreur",
          description:
            data.message || "Erreur lors de la suppression du membre.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du membre.",
        variant: "destructive",
      });
    }
  };

  // Gestion de l'édition
  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedMember = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.email === updatedMember.email ? updatedMember : member
      )
    );
    setIsEditModalOpen(false);
    toast({
      title: "Membre mis à jour",
      description: "Le membre a été mis à jour avec succès.",
    });
  };

  // Gestion de la suppression : ouverture de la modale de confirmation
  const openDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Fonction appelée par la modale de suppression pour confirmer
  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMemberFromBackend(memberToDelete);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
          Membres
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gérez les membres de l'académie
        </p>

        {/* Affichage vertical des deux cards */}
        <div className="flex flex-col gap-6">
          <MemberForm onMemberCreated={handleMemberCreated} />
          <MemberList
            members={members}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </div>

        {/* Modale d'édition */}
        {editingMember && (
          <EditMemberModal
            member={editingMember}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEditedMember}
          />
        )}

        {/* Modale de suppression */}
        <DeleteMemberModal
          isOpen={isDeleteModalOpen}
          member={memberToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AdminLayout>
  );
};

export default Members;
