import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Briefcase, FileText, Image } from "lucide-react";

interface MemberFormProps {
  onMemberCreated: (member: any) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onMemberCreated }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [functionTitle, setFunctionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("admin");
  const { toast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setProfilePicture("");
    setFunctionTitle("");
    setDescription("");
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

    const newMember = {
      firstName,
      lastName,
      email,
      password,
      profilePicture,
      functionTitle,
      description,
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
        toast({
          title: "Membre créé",
          description: `Le membre ${firstName} ${lastName} a été créé avec succès.`,
        });
        onMemberCreated(newMember);
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un membre</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={functionTitle}
              onChange={(e) => setFunctionTitle(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <FileText className="mr-2" />
            <Input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 font-semibold">Rôle :</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded p-2"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
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
  );
};

export default MemberForm;
