import React, { useState, useEffect, useMemo } from "react";
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
import { motion } from "framer-motion";

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
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    role: string;
  }>({
    firstName: "",
    lastName: "",
    role: "",
  });
  // États de chargement distincts pour la création et la suppression
  const [isCreationLoading, setIsCreationLoading] = useState(false);
  const [isDeletionLoading, setIsDeletionLoading] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("postSaveToast");
    if (raw) {
      const { title, description } = JSON.parse(raw);
      toast({ title, description });
      sessionStorage.removeItem("postSaveToast");
    }
  }, [toast]);

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        const count = data.filter((r: any) => r.status === "Nouveau").length;
        setNewRequestsCount(count);
      } catch (error) {
        console.error("Erreur récupération demandes 'Nouveau':", error);
      }
    };

    fetchNewRequestsCount();
  }, []);

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

  const hours = useMemo(() => {
    const result = [];
    for (let h = 9; h <= 20; h++) {
      result.push(h);
      result.push(h + 0.5);
    }
    return result;
  }, []);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
      })
      .catch((err) =>
        console.error(
          "Erreur lors de la récupération de l'utilisateur connecté:",
          err
        )
      );
  }, []);

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
    <AdminLayout newRequestsCount={newRequestsCount}>
      <FullScreenLoader
        isLoading={isCreationLoading || isDeletionLoading}
        messages={isDeletionLoading ? deletionMessages : creationMessages}
      />

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <motion.h1
              className="text-3xl font-bold text-rwdm-blue dark:text-white"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Membres
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Gérez les membres de l'académie
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "list" | "create")}
            className="w-full"
          >
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TabsList
                className={`grid ${
                  user.role === "owner" || user.role === "superadmin"
                    ? "grid-cols-2"
                    : "grid-cols-1"
                } w-full max-w-md`}
              >
                <TabsTrigger value="list">Tous les membres</TabsTrigger>
                {(user.role === "owner" || user.role === "superadmin") && (
                  <TabsTrigger value="create">Créer un membre</TabsTrigger>
                )}
              </TabsList>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <RoleLegendCard className="mt-4" />
            </motion.div>

            <TabsContent value="list">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <MemberList
                  members={members}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  currentUserRole={user.role}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="create">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <MemberForm
                  onMemberCreated={handleMemberCreated}
                  isLoading={isCreationLoading}
                  setIsLoading={setIsCreationLoading}
                  currentUserRole={user.role}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {editingMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EditMemberModal
              member={editingMember}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveEditedMember}
              currentUserRole={user.role}
            />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DeleteMemberModal
            isOpen={isDeleteModalOpen}
            member={memberToDelete}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
          />
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default Members;
