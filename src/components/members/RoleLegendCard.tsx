import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface RoleLegendCardProps {
  className?: string;
}

const RoleLegendCard: React.FC<RoleLegendCardProps> = ({ className }) => {
  const { t } = useTranslation();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("roles_legend_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Badge variant="default">{t("role_owner")}</Badge>
          <p className="text-sm text-gray-700">{t("role_owner_desc")}</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="secondary">{t("role_superadmin")}</Badge>
          <p className="text-sm text-gray-700">{t("role_superadmin_desc")}</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline">{t("role_admin")}</Badge>
          <p className="text-sm text-gray-700">{t("role_admin_desc")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleLegendCard;
