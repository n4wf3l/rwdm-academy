import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { 
  Search, 
  Filter, 
  Clock, 
  Check, 
  X, 
  Calendar as CalendarIcon, 
  User, 
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import RequestDetailsModal, { Request, RequestType, RequestStatus } from "@/components/RequestDetailsModal";

// Données fictives pour notre démo
const MOCK_ADMINS = [
  { id: "1", name: "Sophie Dupont" },
  { id: "2", name: "Thomas Martin" },
  { id: "3", name: "Elise Bernard" },
  { id: "4", name: "Michael Lambert" },
];

// Mock data for our demo with detailed information
const MOCK_REQUESTS: Request[] = [
  {
    id: "REQ-001",
    type: "registration",
    name: "Lucas Dubois",
    email: "lucas.dubois@example.com",
    phone: "+32 470 12 34 56",
    date: new Date(2023, 7, 15),
    status: "new",
    details: {
      playerFirstName: "Lucas",
      playerLastName: "Dubois",
      playerBirthDate: new Date(2010, 5, 12),
      season: "2025/2026",
      birthPlace: "Bruxelles",
      address: "Rue de la Loi 16",
      postalCode: "1000",
      city: "Bruxelles",
      currentClub: "RSC Anderlecht",
      position: "Milieu de terrain",
      category: "U14",
      primaryGuardian: {
        type: "father",
        firstName: "Jean",
        lastName: "Dubois",
        phone: "+32 470 12 34 56",
        email: "jean.dubois@example.com",
        address: "Rue de la Loi 16",
        postalCode: "1000",
        mobilePhone: "+32 470 12 34 56"
      },
      secondaryGuardian: {
        type: "mother",
        firstName: "Marie",
        lastName: "Dubois",
        phone: "+32 470 98 76 54",
        email: "marie.dubois@example.com",
        address: "Rue de la Loi 16",
        postalCode: "1000",
        mobilePhone: "+32 470 98 76 54"
      },
      imageConsent: true,
      signatureDate: new Date(2023, 7, 15),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-002",
    type: "selection-tests",
    name: "Emma Petit",
    email: "emma.petit@example.com",
    phone: "+32 475 23 45 67",
    date: new Date(2023, 7, 16),
    status: "assigned",
    assignedTo: "1",
    details: {
      playerFirstName: "Emma",
      playerLastName: "Petit",
      playerBirthDate: new Date(2011, 3, 23),
      coreGroup: "U12",
      testPeriod: {
        startDate: new Date(2023, 8, 1),
        endDate: new Date(2023, 8, 15)
      },
      currentClub: "Standard de Liège",
      previousClub: "RFC Liège",
      position: "Attaquant",
      primaryGuardian: {
        type: "mother",
        firstName: "Sophie",
        lastName: "Petit",
        phone: "+32 475 23 45 67",
        email: "sophie.petit@example.com"
      },
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-003",
    type: "accident-report",
    name: "Noah Lambert",
    email: "noah.lambert@example.com",
    phone: "+32 478 34 56 78",
    date: new Date(2023, 7, 17),
    status: "in-progress",
    assignedTo: "2",
    details: {
      playerFirstName: "Noah",
      playerLastName: "Lambert",
      affiliationNumber: "BE12345678",
      clubName: "RWDM",
      accidentDescription: "Lors de l'entraînement du 15 juillet 2023, Noah est tombé et s'est blessé à la cheville droite. Il a été transporté à l'hôpital pour des examens complémentaires qui ont révélé une entorse de grade 2.",
      documentUrl: "#",
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      signatureDate: new Date(2023, 7, 17)
    }
  },
  {
    id: "REQ-004",
    type: "responsibility-waiver",
    name: "Chloé Moreau",
    email: "chloe.moreau@example.com",
    phone: "+32 479 45 67 89",
    date: new Date(2023, 7, 18),
    status: "completed",
    assignedTo: "3",
    details: {
      playerFirstName: "Chloé",
      playerLastName: "Moreau",
      playerBirthDate: new Date(2009, 11, 5),
      clubName: "KAA Gent",
      primaryGuardian: {
        type: "mother",
        firstName: "Isabelle",
        lastName: "Moreau",
        phone: "+32 479 45 67 89",
        email: "isabelle.moreau@example.com"
      },
      signatureDate: new Date(2023, 7, 18),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      approvalText: "Lu et approuvé"
    }
  },
  {
    id: "REQ-005",
    type: "registration",
    name: "Louis Lefevre",
    email: "louis.lefevre@example.com",
    phone: "+32 471 56 78 90",
    date: new Date(2023, 7, 19),
    status: "rejected",
    assignedTo: "4",
    details: {
      playerFirstName: "Louis",
      playerLastName: "Lefevre",
      playerBirthDate: new Date(2012, 2, 8),
      season: "2025/2026",
      birthPlace: "Gand",
      address: "Avenue Louise 143",
      postalCode: "1050",
      city: "Bruxelles",
      currentClub: "Club Brugge",
      position: "Gardien",
      category: "U11",
      primaryGuardian: {
        type: "father",
        firstName: "Pierre",
        lastName: "Lefevre",
        phone: "+32 471 56 78 90",
        email: "pierre.lefevre@example.com",
        address: "Avenue Louise 143",
        postalCode: "1050",
        mobilePhone: "+32 471 56 78 90"
      },
      imageConsent: false,
      signatureDate: new Date(2023, 7, 19),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  }
];

// Fonction pour traduire le type en français
const translateRequestType = (type: RequestType): string => {
  switch (type) {
    case 'registration': return 'Inscription à l\'académie';
    case 'selection-tests': return 'Tests de sélection';
    case 'accident-report': return 'Déclaration d\'accident';
    case 'responsibility-waiver': return 'Décharge de responsabilité';
    default: return type;
  }
};

// Fonction pour obtenir la couleur du badge selon le statut
const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'new': return <Badge className="bg-blue-500">Nouveau</Badge>;
    case 'assigned': return <Badge className="bg-purple-500">Assigné</Badge>;
    case 'in-progress': return <Badge className="bg-yellow-500">En cours</Badge>;
    case 'completed': return <Badge className="bg-green-500">Terminé</Badge>;
    case 'rejected': return <Badge className="bg-red-500">Rejeté</Badge>;
    default: return <Badge>Inconnu</Badge>;
  }
};

const Dashboard = () => {
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for the details modal
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination for completed requests
  const [completedRequestsPage, setCompletedRequestsPage] = useState(1);
  const completedRequestsPerPage = 5;

  // Filtrer les demandes selon les critères (exclut les demandes terminées de la liste principale)
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? request.status !== 'completed' : request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Filtrer les demandes terminées
  const completedRequests = requests.filter(request => request.status === 'completed');
  
  // Calculer la pagination pour les demandes terminées
  const totalCompletedPages = Math.ceil(completedRequests.length / completedRequestsPerPage);
  const paginatedCompletedRequests = completedRequests.slice(
    (completedRequestsPage - 1) * completedRequestsPerPage,
    completedRequestsPage * completedRequestsPerPage
  );

  // Assigner une demande à un administrateur
  const assignRequest = (requestId: string, adminId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? { ...req, assignedTo: adminId, status: req.status === 'new' ? 'assigned' : req.status } 
          : req
      )
    );
    
    const request = requests.find(r => r.id === requestId);
    const admin = MOCK_ADMINS.find(a => a.id === adminId);
    
    if (request && admin) {
      toast({
        title: "Demande assignée",
        description: `La demande de ${request.name} a été assignée à ${admin.name}.`,
      });
    }
  };

  // Changer le statut d'une demande
  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    
    const statusLabels: Record<RequestStatus, string> = {
      'new': 'Nouveau',
      'assigned': 'Assigné',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'rejected': 'Rejeté'
    };
    
    toast({
      title: "Statut mis à jour",
      description: `Le statut a été changé en "${statusLabels[newStatus]}".`,
    });

    // Si le statut est passé à 'completed' et qu'il s'agit d'une inscription, proposer de planifier un RDV
    const request = requests.find(r => r.id === requestId);
    if (newStatus === 'completed' && request?.type === 'registration') {
      toast({
        title: "Inscription validée",
        description: "Vous pouvez maintenant planifier un rendez-vous pour finaliser l'inscription.",
      });
      navigate('/planning', { state: { scheduleAppointment: true, request } });
    }
  };
  
  // Open request details modal
  const openRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  
  // Close request details modal
  const closeRequestDetails = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Tableau de bord</h1>
            <p className="text-gray-600 dark:text-gray-300">Gérez les demandes et suivez leur progression</p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/planning">
              <Button className="bg-rwdm-blue">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Voir le planning
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-4">
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')}
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
                      onValueChange={(value) => setTypeFilter(value as RequestType | 'all')}
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
            
            <Card>
              <CardHeader>
                <CardTitle>Liste des demandes ({filteredRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Assigné à</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Aucune demande ne correspond à vos critères de recherche.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => openRequestDetails(request)}>
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{translateRequestType(request.type)}</TableCell>
                            <TableCell>
                              <div>
                                <div>{request.name}</div>
                                <div className="text-xs text-gray-500">{request.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{request.date.toLocaleDateString('fr-BE')}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Select
                                value={request.assignedTo || ''}
                                onValueChange={(value) => assignRequest(request.id, value)}
                                onPointerDownCapture={(e) => e.stopPropagation()}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Assigner à" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Non assigné</SelectItem>
                                  {MOCK_ADMINS.map((admin) => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                      {admin.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRequestDetails(request);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateRequestStatus(request.id, 'in-progress');
                                  }}
                                  disabled={request.status === 'in-progress'}
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateRequestStatus(request.id, 'completed');
                                  }}
                                  disabled={request.status === 'completed'}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateRequestStatus(request.id, 'rejected');
                                  }}
                                  disabled={request.status === 'rejected'}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Card pour les demandes terminées avec pagination */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Demandes terminées ({completedRequests.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {paginatedCompletedRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune demande terminée pour le moment.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Détails</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCompletedRequests.map((request) => (
                          <TableRow key={request.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => openRequestDetails(request)}>
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{translateRequestType(request.type)}</TableCell>
                            <TableCell>
                              <div>
                                <div>{request.name}</div>
                                <div className="text-xs text-gray-500">{request.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{request.date.toLocaleDateString('fr-BE')}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRequestDetails(request);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                
                {/* Pagination controls */}
                {completedRequests.length > completedRequestsPerPage && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <div className="text-sm text-gray-600">
                      Page {completedRequestsPage} sur {totalCompletedPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletedRequestsPage(prev => Math.max(prev - 1, 1))}
                        disabled={completedRequestsPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletedRequestsPage(prev => Math.min(prev + 1, totalCompletedPages))}
                        disabled={completedRequestsPage === totalCompletedPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des demandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rwdm-blue">
                          {requests.filter(r => r.status === 'new').length}
                        </div>
                        <div className="text-sm text-gray-600">Nouvelles demandes</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rwdm-blue">
                          {requests.filter(r => r.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-gray-600">Demandes en cours</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rwdm-blue">
                          {requests.filter(r => r.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Demandes complétées</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rwdm-blue">
                          {requests.filter(r => !r.assignedTo).length}
                        </div>
                        <div className="text-sm text-gray-600">Non assignées</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Request Details Modal */}
      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={closeRequestDetails}
        request={selectedRequest}
      />
    </AdminLayout>
  );
};

export default Dashboard;
