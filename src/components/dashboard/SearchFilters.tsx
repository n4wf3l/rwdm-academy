
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { RequestStatus, RequestType } from "@/components/RequestDetailsModal";

interface SearchFiltersProps {
  searchQuery: string;
  statusFilter: RequestStatus | 'all';
  typeFilter: RequestType | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: RequestStatus | 'all') => void;
  onTypeFilterChange: (value: RequestType | 'all') => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres de recherche</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher par nom, email ou ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as RequestStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="assigned">Assigné</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={typeFilter}
              onValueChange={(value) => onTypeFilterChange(value as RequestType | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="registration">Inscription</SelectItem>
                <SelectItem value="selection-tests">Tests de sélection</SelectItem>
                <SelectItem value="accident-report">Accident</SelectItem>
                <SelectItem value="responsibility-waiver">Décharge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;