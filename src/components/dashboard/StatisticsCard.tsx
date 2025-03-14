
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Request } from "@/components/RequestDetailsModal";

interface StatisticsCardProps {
  requests: Request[];
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ requests }) => {
  return (
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
                  {requests.filter(r => r.status === 'in-progress' && r.type !== 'accident-report').length}
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
                  {requests.filter(r => r.type === 'accident-report' && r.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">Accidents en attente</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
