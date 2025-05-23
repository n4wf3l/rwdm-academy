import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Briefcase,
  FileText,
  Image,
  EyeOff,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTranslation } from "@/hooks/useTranslation";

interface EditMemberModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: any) => void;
  currentUserRole: string;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
  currentUserRole,
}) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(member?.firstName || "");
  const [lastName, setLastName] = useState(member?.lastName || "");
  const [email, setEmail] = useState(member?.email || "");
  const [func, setFunc] = useState(member?.function || ""); // fonction
  const [profilePicture, setProfilePicture] = useState(
    member?.profilePicture || ""
  );
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(member?.role || "admin");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (member) {
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setEmail(member.email);
      setFunc(member.function || member.functionTitle || ""); // support backward
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
      functionTitle: func,
      profilePicture,
      role,
      password: password || undefined,
    };

    await onSave(updatedMember);

    sessionStorage.setItem(
      "postSaveToast",
      JSON.stringify({
        title: "Membre mis à jour",
        description: `${updatedMember.firstName} ${updatedMember.lastName} a bien été modifié.`,
      })
    );
    onClose();
    window.location.reload();
  };

  const options: Array<{ value: typeof role; label: string }> = [
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Superadmin" },
    ...(currentUserRole === "owner"
      ? [{ value: "owner", label: "Owner" }]
      : []),
  ];

  const disabledOwnerOption =
    currentUserRole === "superadmin" && role === "owner";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-xl mx-auto">
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-lg font-bold">{t("member.edit_title")}</h2>

          <div className="flex items-center">
            <User className="mr-2" />
            <Input
              type="text"
              placeholder={t("lastNamePlaceholder")}
              value={firstName}
              maxLength={20}
              onChange={(e) => {
                const value = e.target.value;
                // Autorise uniquement lettres, accents et espaces, max 20 lettres
                if (
                  value.length <= 20 &&
                  /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(value)
                ) {
                  setFirstName(value);
                }
              }}
              required
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <User className="mr-2" />
            <Input
              type="text"
              placeholder={t("firstNamePlaceholder")}
              value={lastName}
              maxLength={20}
              onChange={(e) => {
                const value = e.target.value;
                // Autorise uniquement lettres, accents et espaces, max 20 lettres
                if (
                  value.length <= 20 &&
                  /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(value)
                ) {
                  setLastName(value);
                }
              }}
              required
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <Mail className="mr-2" />
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              maxLength={50}
              onChange={(e) => setEmail(e.target.value)}
              pattern="[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"
              required
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <Briefcase className="mr-2" />
            <Input
              type="text"
              placeholder={t("functionPlaceholder")}
              value={func}
              maxLength={60}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 60) {
                  setFunc(value);
                }
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <img
              src={profilePicture || "/avatar.jpg"}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border shadow"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== window.location.origin + "/avatar.jpg") {
                  target.src = "/avatar.jpg";
                }
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="flex items-center">
            <span className="mr-2 font-semibold whitespace-nowrap">
              {t("roleLabel")}
            </span>
            <Select
              value={role}
              onValueChange={(newRole) => {
                if (currentUserRole === "superadmin" && newRole === "owner")
                  return;
                setRole(newRole as typeof role);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === "owner" && disabledOwnerOption}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap font-semibold">
              {t("passwordPlaceholder")}
            </span>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Laisser vide pour ne pas changer"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="bg-rwdm-blue">
            {t("button.save")}
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default EditMemberModal;
