import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Briefcase, FileText, Image } from "lucide-react";
import FullScreenLoader from "@/components/FullScreenLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MemberFormProps {
  onMemberCreated: (member: any) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentUserRole: string;
}

const MemberForm: React.FC<MemberFormProps> = ({
  onMemberCreated,
  isLoading,
  setIsLoading,
  currentUserRole,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [func, setFunc] = useState(""); // maintenant fonction principale
  const [role, setRole] = useState("admin");
  const { toast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setProfilePicture("");
    setFunc("");
    setRole("admin");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newMember = {
      firstName,
      lastName,
      email,
      password,
      profilePicture,
      function: func,
      role,
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });
      const data = await response.json();

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 4000));

        toast({
          title: "Membre créé",
          description: `Le membre ${firstName} ${lastName} a été créé avec succès.`,
        });

        // Ajoute la date locale pour un affichage immédiat
        const localCreatedAt = new Date().toISOString();

        onMemberCreated(data);

        resetForm();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la création du membre.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du membre:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du membre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FullScreenLoader isLoading={isLoading} />
      <Card>
        <CardHeader>
          <CardTitle>Créer un membre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="md:flex md:space-x-4">
              {/* Colonne gauche */}
              <div className="flex flex-col space-y-4 md:w-1/2">
                <div className="flex items-center">
                  <User className="mr-2" />
                  <Input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <User className="mr-2" />
                  <Input
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <Lock className="mr-2" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col space-y-4 md:w-1/2">
                <div className="flex items-center">
                  <Image className="mr-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border rounded p-2"
                  />
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-2" />
                  <Input
                    type="text"
                    placeholder="Fonction"
                    value={func}
                    onChange={(e) => setFunc(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 font-semibold">Rôle :</span>
                  <Select
                    value={role}
                    onValueChange={(newRole) => setRole(newRole)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                      {currentUserRole === "owner" && (
                        <SelectItem value="owner">Owner</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button type="submit" className="bg-rwdm-blue">
                Créer le membre
              </Button>
            </div>
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
    </>
  );
};

export default MemberForm;
