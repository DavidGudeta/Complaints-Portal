import { Type } from "@google/genai";

export enum UserRole {
  DIRECTOR = "DIRECTOR",
  TEAM_LEADER = "TEAM_LEADER",
  OFFICER = "OFFICER",
  ADMIN = "ADMIN",
  PUBLIC = "PUBLIC"
}

export enum ComplaintStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  ASSESSED = "ASSESSED",
  RESPONDED = "RESPONDED",
  APPROVED = "APPROVED",
  CLOSED = "CLOSED",
  REOPENED = "REOPENED"
}

export enum NotificationType {
  NEW_COMPLAINT = "NEW_COMPLAINT",
  ASSIGNMENT = "ASSIGNMENT",
  STATUS_UPDATE = "STATUS_UPDATE",
  NEW_RESPONSE = "NEW_RESPONSE",
  DEADLINE_REMINDER = "DEADLINE_REMINDER"
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  tax_center_id?: number;
}

export interface TaxCenter {
  id: number;
  name: string;
  location: string;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  parent_id?: number;
}

export interface Complaint {
  id: number;
  tracking_code: string;
  tin: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  category_id: number;
  subcategory_id?: number;
  tax_center_id?: number;
  description: string;
  mrc_code?: string;
  ref_no?: string;
  woreda?: string;
  zone?: string;
  region?: string;
  status: ComplaintStatus;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  category_name?: string;
  subcategory_name?: string;
  assigned_name?: string;
  tax_center_name?: string;
}

export interface ComplaintResponse {
  id: number;
  complaint_id: number;
  user_id: number;
  user_name: string;
  user_role: UserRole;
  message: string;
  created_at: string;
  tracking_code?: string;
  complainant_name?: string;
}

export interface Assessment {
  id: number;
  complaint_id: number;
  user_id: number;
  assessor_name: string;
  findings: string;
  recommendation?: string;
  created_at: string;
  tracking_code: string;
  complainant_name: string;
}

export interface Attachment {
  id: number;
  complaint_id: number;
  filename: string;
  url: string;
}
