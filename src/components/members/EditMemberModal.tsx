import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Briefcase, FileText, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditMemberModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: any) => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(member?.firstName || "");
  const [lastName, setLastName] = useState(member?.lastName || "");
  const [email, setEmail] = useState(member?.email || "");
  const [func, setFunc] = useState(member?.function || ""); // fonction
  const [profilePicture, setProfilePicture] = useState(
    member?.profilePicture || ""
  );
  const [role, setRole] = useState(member?.role || "admin");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (member) {
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setEmail(member.email);
      setFunc(member.function || member.functionTitle || ""); // 🧠 support backward
      setProfilePicture(member.profilePicture);
      setRole(member.role);
      setPassword("");
    }
  }, [member]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMember = {
      ...member,
      firstName,
      lastName,
      email,
      functionTitle: func, // ✅ Changement ici
      profilePicture,
      role,
      password: password || undefined,
    };

    await onSave(updatedMember);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-lg font-bold">Modifier le membre</h2>

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
          <Briefcase className="mr-2" />
          <Input
            type="text"
            placeholder="Fonction"
            value={func}
            onChange={(e) => setFunc(e.target.value)}
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
          <span className="mr-2 font-semibold">Rôle :</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded p-2"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <div className="flex items-center">
          <span className="mr-2 font-semibold">Mot de passe :</span>
          <Input
            type="password"
            placeholder="Laisser vide pour ne pas changer"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="bg-rwdm-blue">
          Sauvegarder
        </Button>
      </form>
    </Modal>
  );
};

export default EditMemberModal;
