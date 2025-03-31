import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  functionTitle: string;
  description: string;
  role: string;
}

interface MemberListProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres inscrits ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={member.profilePicture}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/150";
                  }}
                />
                <div>
                  <div className="font-bold">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                  <div className="text-sm text-gray-500">
                    {member.functionTitle}
                  </div>
                  <div className="text-xs text-gray-400">
                    {member.description}
                  </div>
                  <div className="text-xs text-gray-400">{member.role}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => onDelete(member)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberList;
