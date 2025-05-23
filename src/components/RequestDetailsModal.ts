import React from "react";

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
  email: string; // Add this required property
  details: any;
  assignedTo?: string;
  sent_at?: string;
}

export interface RequestStatus {
  label: string;
  value: string;
}

// Don't export a default component from here
// This file should be for types only
