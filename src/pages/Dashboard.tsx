
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import RequestDetailsModal, { Request, RequestType, RequestStatus } from "@/components/RequestDetailsModal";

// Import our new components
import SearchFilters from "@/components/dashboard/SearchFilters";
import RequestsTable from "@/components/dashboard/RequestsTable";
import CompletedRequestsCard from "@/components/dashboard/CompletedRequestsCard";
import PendingAccidentsCard from "@/components/dashboard/PendingAccidentsCard";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import AppointmentDialog from "@/components/dashboard/AppointmentDialog";
import { MOCK_ADMINS, MOCK_REQUESTS } from "@/components/dashboard/MockData";

const Dashboard = () => {
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [completedRequestsPage, setCompletedRequestsPage] = useState(1);
  const completedRequestsPerPage = 5;
  
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const [pendingAccidentReportsPage, setPendingAccidentReportsPage] = useState(1);
  const pendingAccidentReportsPerPage = 5;

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? 
                          (request.status !== 'completed' && !(request.type === 'accident-report' && request.status === 'in-progress')) : 
                          request.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const completedRequests = requests.filter(request => request.status === 'completed');
  
  const pendingAccidentReports = requests.filter(request => 
    request.type === 'accident-report' && request.status === 'in-progress'
  );
  
  const totalCompletedPages = Math.ceil(completedRequests.length / completedRequestsPerPage);
  const paginatedCompletedRequests = completedRequests.slice(
    (completedRequestsPage - 1) * completedRequestsPerPage,
    completedRequestsPage * completedRequestsPerPage
  );

  const totalPendingAccidentPages = Math.ceil(pendingAccidentReports.length / pendingAccidentReportsPerPage);
  const paginatedPendingAccidents = pendingAccidentReports.slice(
    (pendingAccidentReportsPage - 1) * pendingAccidentReportsPerPage,
    pendingAccidentReportsPage * pendingAccidentReportsPerPage
  );

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

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

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

    if (newStatus === 'completed') {
      handleCompletedRequest(request);
    }
  };

  const handleCompletedRequest = (request: Request) => {
    switch (request.type) {
      case 'registration':
        setCurrentRequestId(request.id);
        setIsAppointmentDialogOpen(true);
        break;
        
      case 'selection-tests':
        toast({
          title: "Tests validés",
          description: "Les données ont été transmises aux membres.",
        });
        break;
        
      case 'responsibility-waiver':
        toast({
          title: "Décharge validée",
          description: "Le document a bien été stocké.",
        });
        break;
        
      case 'accident-report':
        toast({
          title: "Déclaration d'accident",
          description: "La demande a été déplacée dans les accidents en attente.",
        });
        break;
    }
  };

  const sendAccidentToFederation = (requestId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: 'completed' } : req
      )
    );
    
    toast({
      title: "Déclaration envoyée",
      description: "La déclaration d'accident a été transmise à l'Union Belge.",
    });
  };

  const handleAppointmentTypeSelection = (type: 'test' | 'secretariat') => {
    if (type === 'test') {
      // Close dialog immediately for test technique
      setIsAppointmentDialogOpen(false);
      
      toast({
        title: "Tests techniques programmés",
        description: "Les données ont été transmises aux membres.",
      });
      
      // Update the request status to completed
      if (currentRequestId) {
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === currentRequestId ? { ...req, status: 'completed' } : req
          )
        );
      }
    } else {
      const request = requests.find(r => r.id === currentRequestId);
      
      if (request) {
        // Only navigate to planning for secretariat appointments
        navigate('/planning', { 
          state: { 
            scheduleAppointment: true, 
            request,
            appointmentType: type,
            appointmentTitle: "Rendez-vous au secrétariat"
          } 
        });
        
        // Close the dialog
        setIsAppointmentDialogOpen(false);
      }
    }
  };

  const openRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

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
            <SearchFilters 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onTypeFilterChange={setTypeFilter}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Liste des demandes ({filteredRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <RequestsTable 
                    requests={filteredRequests}
                    admins={MOCK_ADMINS}
                    onAssignRequest={assignRequest}
                    onUpdateStatus={updateRequestStatus}
                    onViewDetails={openRequestDetails}
                  />
                </div>
              </CardContent>
            </Card>
            
            <PendingAccidentsCard 
              pendingAccidents={paginatedPendingAccidents}
              page={pendingAccidentReportsPage}
              totalPages={totalPendingAccidentPages}
              onPageChange={setPendingAccidentReportsPage}
              onViewDetails={openRequestDetails}
              onSendToFederation={sendAccidentToFederation}
            />
            
            <CompletedRequestsCard 
              completedRequests={paginatedCompletedRequests}
              page={completedRequestsPage}
              totalPages={totalCompletedPages}
              onPageChange={setCompletedRequestsPage}
              onViewDetails={openRequestDetails}
            />
          </TabsContent>
          
          <TabsContent value="stats">
            <StatisticsCard requests={requests} />
          </TabsContent>
        </Tabs>
      </div>
      
      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={closeRequestDetails}
        request={selectedRequest}
      />
      
      <AppointmentDialog 
        isOpen={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        onSelectAppointmentType={handleAppointmentTypeSelection}
      />
    </AdminLayout>
  );
};

export default Dashboard;
