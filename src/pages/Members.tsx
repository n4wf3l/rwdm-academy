import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { CAvatar } from "@coreui/react"; // Importing the Avatar component
import { User, Mail, Lock, Briefcase, FileText, Image } from "lucide-react"; // Importer les icônes

const Members = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>(""); // État pour la photo de profil
  const [functionTitle, setFunctionTitle] = useState(""); // État pour la fonction
  const [description, setDescription] = useState(""); // État pour la description
  const { toast } = useToast();

  const [members, setMembers] = useState([]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Créer un membre</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center">
                  <User className="mr-2" />
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
                  <User className="mr-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <CAvatar src={member.profilePicture} />
                  <div>
                    <div className="font-bold">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                    <div className="text-sm text-gray-500">
                      {member.functionTitle}
                    </div>{" "}
                    {/* Affichage de la fonction */}
                    <div className="text-xs text-gray-400">
                      {member.description}
                    </div>{" "}
                    {/* Affichage de la description */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Members;
