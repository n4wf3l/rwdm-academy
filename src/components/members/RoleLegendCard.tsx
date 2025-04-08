import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoleLegendCardProps {
  className?: string;
}

const RoleLegendCard: React.FC<RoleLegendCardProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Légende des rôles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Badge variant="default">Owner</Badge>
          <p className="text-sm text-gray-700">
            Directeur de la plateforme – accès complet à toutes les
            fonctionnalités.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="secondary">Superadmin</Badge>
          <p className="text-sm text-gray-700">
            Responsable de la gestion – accès à la configuration, utilisateurs
            et assignations.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline">Admin</Badge>
          <p className="text-sm text-gray-700">
            Gestionnaire planning – accès au planning et tableau de bord
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleLegendCard;
