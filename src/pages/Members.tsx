import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import MemberForm from "@/components/members/MemberForm";
import MemberList from "@/components/members/MemberList";
import EditMemberModal from "@/components/members/EditMemberModal";
import DeleteMemberModal from "@/components/members/DeleteMemberModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FullScreenLoader from "@/components/FullScreenLoader";
import RoleLegendCard from "@/components/members/RoleLegendCard";

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  function: string;
  role: string;
  createdAt: string;
}

const Members: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // États de chargement distincts pour la création et la suppression
  const [isCreationLoading, setIsCreationLoading] = useState(false);
  const [isDeletionLoading, setIsDeletionLoading] = useState(false);

  // Messages pour le loader
  const creationMessages = [
    "Création du compte en cours...",
    "Sécurisation du compte...",
    "Finalisation...",
  ];
  const deletionMessages = [
    "Suppression du compte en cours...",
    "Vérification de la suppression...",
    "Finalisation de la suppression...",
  ];

  // Récupération des membres depuis le backend
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
    setActiveTab("list");
  };

  // Fonction de suppression via le backend
  const deleteMemberFromBackend = async (member: Member) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admins/${encodeURIComponent(member.email)}`,
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

  const handleSaveEditedMember = async (updatedMember: Member) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admins/${updatedMember.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedMember),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === updatedMember.id ? data : m))
        );
        toast({
          title: "Membre mis à jour",
          description: "Le membre a été mis à jour avec succès.",
        });
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description:
            data.message || "Erreur lors de la mise à jour du membre.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du membre.",
        variant: "destructive",
      });
    }
    setIsEditModalOpen(false);
  };

  // Ouverture de la modal de confirmation de suppression
  const openDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Fonction appelée par la modal de suppression pour confirmer
  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      // Fermer immédiatement la modal de confirmation
      setIsDeleteModalOpen(false);
      // Mettre à jour le loader pour la suppression
      setIsDeletionLoading(true);
      // Attendre 4 secondes pour simuler le traitement
      await new Promise((resolve) => setTimeout(resolve, 4000));
      // Procéder à la suppression réelle
      await deleteMemberFromBackend(memberToDelete);
      // Cacher le loader et réinitialiser l'état
      setIsDeletionLoading(false);
      setMemberToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <FullScreenLoader
        isLoading={isCreationLoading || isDeletionLoading}
        messages={isDeletionLoading ? deletionMessages : creationMessages}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Membres
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les membres de l'académie
            </p>
          </div>
          <div>
            <Link to="/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </div>
        </div>

        <Tabs
          defaultValue="list"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "list" | "create")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="list">Tous les membres</TabsTrigger>
            <TabsTrigger value="create">Créer un membre</TabsTrigger>
          </TabsList>
          <RoleLegendCard className="mt-4" />

          <TabsContent value="list">
            <MemberList
              members={members}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          </TabsContent>
          <TabsContent value="create">
            <MemberForm
              onMemberCreated={handleMemberCreated}
              isLoading={isCreationLoading}
              setIsLoading={setIsCreationLoading}
            />
          </TabsContent>
        </Tabs>

        {editingMember && (
          <EditMemberModal
            member={editingMember}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEditedMember}
          />
        )}

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
