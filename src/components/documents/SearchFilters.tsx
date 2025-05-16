import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type DocumentType =
  | "registration"
  | "selection-tests"
  | "responsibility-waiver"
  | "accident-report"
  | "all";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  adminFilter: string;
  setAdminFilter: (val: string) => void;
  typeFilter: DocumentType;
  setTypeFilter: (val: DocumentType) => void;
  uniqueAdmins: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  adminFilter,
  setAdminFilter,
  typeFilter,
  setTypeFilter,
  uniqueAdmins,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="mb-2">
        <CardHeader>
          <motion.div whileHover={{ scale: 1.01 }}>
            <CardTitle>{t("searchFilters")}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div className="flex flex-col md:flex-row gap-4" layout>
            <motion.div
              className="flex relative flex-1"
              whileHover={{ scale: 1.01 }}
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Select
                value={adminFilter}
                onValueChange={(value) => setAdminFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Assigné à" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allAdmins")}</SelectItem>
                  {uniqueAdmins.map((admin) => (
                    <SelectItem key={admin} value={admin}>
                      {admin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as DocumentType)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes")}</SelectItem>
                  <SelectItem value="registration">
                    {t("registration")}
                  </SelectItem>
                  <SelectItem value="selection-tests">
                    {t("selectionTests")}
                  </SelectItem>
                  <SelectItem value="responsibility-waiver">
                    {t("responsibilityWaiver")}
                  </SelectItem>
                  <SelectItem value="accident-report">
                    {t("accidentReport")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SearchFilters;
