
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const { authUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header>
      <nav className="bg-rwdm-blue dark:bg-rwdm-blue-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center text-white">
            <img src="/logo.png" alt="RWDM Academy Logo" className="h-8 mr-2" />
            <span className="font-bold text-lg">RWDM Academy</span>
          </Link>
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={authUser.profilePicture} />
                  <AvatarFallback>
                    {authUser.firstName[0]}
                    {authUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon Profil</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link to="/profile">Modifier le profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ul>
              <li>
                <NavLink
                  to="/login"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Se connecter
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className="text-white hover:text-gray-300 transition-colors ml-4"
                >
                  S'inscrire
                </NavLink>
              </li>
            </ul>
          )}
        </div>
        <ul>
          <li>
            <Link to="/legal" className="text-white hover:text-gray-300 transition-colors">
              Informations Légales
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
