import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { CAvatar } from "@coreui/react"; // Importing the Avatar component
import { User, Mail, Lock, Briefcase, FileText, Image, Edit, Trash } from "lucide-react"; // Importer les icônes
import Modal from "@/components/ui/modal"; // Assurez-vous d'importer le composant Modal

const Members = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>(""); // État pour la photo de profil
  const [functionTitle, setFunctionTitle] = useState(""); // État pour la fonction
  const [description, setDescription] = useState(""); // État pour la description
  const { toast } = useToast();

  const [members, setMembers] = useState([
    {
      firstName: "Lucas",
      lastName: "Dubois",
      email: "lucas.dubois@example.com",
      password: "password123",
      profilePicture: "https://via.placeholder.com/150",
      functionTitle: "Joueur",
      description: "Milieu de terrain",
    },
    {
      firstName: "Emma",
      lastName: "Petit",
      email: "emma.petit@example.com",
      password: "password123",
      profilePicture: "https://via.placeholder.com/150",
      functionTitle: "Joueuse",
      description: "Attaquante",
    },
    {
      firstName: "Noah",
      lastName: "Lambert",
      email: "noah.lambert@example.com",
      password: "password123",
      profilePicture: "https://via.placeholder.com/150",
      functionTitle: "Joueur",
      description: "Défenseur",
    },
  ]);

  const [editingMember, setEditingMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = {
      firstName,
      lastName,
      email,
      password,
      profilePicture,
      functionTitle,
      description,
    }; // Ajout des nouveaux champs
    setMembers([...members, newMember]);
    toast({
      title: "Membre créé",
      description: `Le membre ${firstName} ${lastName} a été créé avec succès.`,
    });
    resetForm();
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setProfilePicture(""); // Réinitialiser le champ photo de profil
    setFunctionTitle(""); // Réinitialiser le champ fonction
    setDescription(""); // Réinitialiser le champ description
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfilePicture(reader.result); // Mettre à jour l'état avec l'URL de l'image
        }
      };
      reader.readAsDataURL(file); // Lire le fichier comme une URL de données
    }
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email);
    setFunctionTitle(member.functionTitle);
    setDescription(member.description);
    setProfilePicture(member.profilePicture);
    setIsEditModalOpen(true);
  };

  const updateMember = () => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.email === editingMember.email
          ? { ...member, firstName, lastName, email, functionTitle, description, profilePicture }
          : member
      )
    );
    toast({
      title: "Membre mis à jour",
      description: `Le membre ${firstName} ${lastName} a été mis à jour avec succès.`,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const openDeleteModal = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const deleteMember = () => {
    setMembers((prevMembers) => prevMembers.filter((member) => member.email !== memberToDelete.email));
    toast({
      title: "Membre supprimé",
      description: `Le membre ${memberToDelete.firstName} ${memberToDelete.lastName} a été supprimé avec succès.`,
    });
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Membres</h1>
            <p className="text-gray-600 dark:text-gray-300">Gérez les membres de l'académie</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer un membre</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <User  className="mr-2" />
                    <Input
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <User  className="mr-2" />
                    <Input
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <Mail className="mr-2" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <Lock className="mr-2" />
                    <Input
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <Image className="mr-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border rounded p-2"
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <Briefcase className="mr-2" />
                    <Input
                      type="text"
                      placeholder="Fonction"
                      value={functionTitle}
                      onChange={(e) => setFunctionTitle(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <FileText className="mr-2" />
                    <Input
                      type="text"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                </div>
                <Button type="submit" className="bg-rwdm-blue">
                  Créer le membre
                </Button>
              </form>
              {profilePicture && (
                <div className="mt-4">
                  <img
                    src={profilePicture}
                    alt="Photo de profil"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membres inscrits ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <CAvatar src={member.profilePicture} />
                      <div>
                        <div className="font-bold">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-sm text-gray-500">
                          {member.functionTitle}
                        </div>
                        <div className="text-xs text-gray-400">
                          {member.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => openEditModal(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openDeleteModal(member)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modale pour modifier un membre */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={updateMember} className="space-y-4">
            <h2 className="text-lg font-bold">Modifier le membre</h2>
            <div>
              <label className="flex items-center">
                <User  className="mr-2" />
                <Input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <User  className="mr-2" />
                <Input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <Mail className="mr-2" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <Briefcase className="mr-2" />
                <Input
                  type="text"
                  placeholder="Fonction"
                  value={functionTitle}
                  onChange={(e) => setFunctionTitle(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <FileText className="mr-2" />
                <Input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>
            <Button type="submit" className="bg-rwdm-blue">
              Mettre à jour le membre
            </Button>
          </form>
        </Modal>

        {/* Modale pour supprimer un membre */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div>
            <h2 className="text-lg font-bold">Supprimer le membre</h2>
            <p>Êtes-vous sûr de vouloir supprimer le membre {memberToDelete?.firstName} {memberToDelete?.lastName} ?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={deleteMember}>Supprimer</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Members;