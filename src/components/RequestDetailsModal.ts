export type RequestType =
  | "accident-report"
  | "healing-certificate"
  | "accident-notify"
  | "healing-notify";

export interface Request {
  id: string;
  date: string;
  type: RequestType;
  status: string;
  name: string;
  details: any;
  assignedTo?: string;
  sent_at?: string;
}

export interface RequestStatus {
  label: string;
  value: string;
}

const RequestDetailsModal = (props) => {
  // Component logic here
};

export default RequestDetailsModal;
