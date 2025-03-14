import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Search } from "lucide-react"; // Importer l'icône de recherche
import { CAvatar } from "@coreui/react";

// Types pour les documents
type DocumentType = 'registration' | 'selection-tests' | 'responsibility-waiver' | 'accident-report';

interface Document {
  [x: string]: string;
  id: string;
  type: DocumentType;
  name: string;
  surname: string;
  email: string;
  phone: string;
  documentUrl: string;
}

// Données fictives pour notre démo
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "DOC-001",
    type: "registration",
    name: "Lucas",
    surname: "Dubois",
    email: "lucas.dubois@example.com",
    phone: "+32 470 12 34 56",
    documentUrl: "https://example.com/doc1.pdf"
  },
  {
    id: "DOC-002",
    type: "selection-tests",
    name: "Emma",
    surname: "Petit",
    email: "emma.petit@example.com",
    phone: "+32 475 23 45 67",
    documentUrl: "https://example.com/doc2.pdf"
  },
  {
    id: "DOC-003",
    type: "responsibility-waiver",
    name: "Noah",
    surname: "Lambert",
    email: "noah.lambert@example.com",
    phone: "+32 478 34 56 78",
    documentUrl: "https://example.com/doc3.pdf"
  },
  {
    id: "DOC-004",
    type: "accident-report",
    name: "Chloé",
    surname: "Moreau",
    email: "chloe.moreau@example.com",
    phone: "+32 479 45 67 89",
    documentUrl: "https://example.com/doc4.pdf"
  },
];

const Documents = () => {
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const { toast } = useToast();

  // Filtrer les documents selon les critères
  const handleFilter = () => {
    const filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.phone.includes(searchQuery);
      
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
    setFilteredDocuments(filtered);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Gestion des documents</h1>
            <p className="text-gray-600 dark:text-gray-300">Retrouvez les documents des membres</p>
          </div>
        </div>

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
                  placeholder="Rechercher par nom, prénom, email ou téléphone..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilter();
                  }}
                />
              </div>
              
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as DocumentType | 'all');
                  handleFilter();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="registration">Inscriptions</SelectItem>
                  <SelectItem value="selection-tests">Tests techniques</SelectItem>
                  <SelectItem value="responsibility-waiver">Décharges de responsabilité</SelectItem>
                  <SelectItem value="accident-report">Déclarations d'accident</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Aucun document ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <CAvatar src={doc.profilePicture || "https://via.placeholder.com/150"} />
                      <div>
                        <div className="font-bold">
                          {doc.name} {doc.surname}
                        </div>
                        <div className="text-sm text-gray-500">{doc.email}</div>
                        <div className="text-sm text-gray-500">{doc.phone}</div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => window.open(doc.documentUrl, "_blank")}>
                      Voir document
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Documents;