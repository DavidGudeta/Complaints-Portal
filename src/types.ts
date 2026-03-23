
export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  TEAM_LEADER = 'TEAM_LEADER',
  OFFICER = 'OFFICER',
  TAXPAYER = 'TAXPAYER'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ASSESSED = 'ASSESSED',
  RESPONDED = 'RESPONDED',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export interface Complaint {
  COMPLAINTS_ID: string;
  TIN: string;
  COMPLAINANT_NAME: string;
  COMPLAINANT_EMAIL?: string;
  COMPLAINANT_PHONE: string;
  ENTERPRISE_ADDRESS?: string;
  CUSTOMER_ADDRESS?: string;
  COMPLAINT_CODE: string;
  MACHINE_CODE?: string;
  REFERENCE_NO?: string;
  category_name: string;
  subcategory_name?: string;
  COMPLAINTS_TITLE: string;
  COMPLAIN_DETAILS: string;
  tax_center_name: string;
  tax_center_id?: string;
  CASE_STATUS: ComplaintStatus;
  APPLIED_DATE: string;
  LAST_UPDATED_DATE?: string;
  assigned_name?: string;
  assigned_id?: string;
}

export enum NotificationType {
  NEW_COMPLAINT = 'NEW_COMPLAINT',
  ASSIGNMENT = 'ASSIGNMENT',
  STATUS_UPDATE = 'STATUS_UPDATE',
  NEW_RESPONSE = 'NEW_RESPONSE',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER'
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface ComplaintResponse {
  id: string;
  complaint_id: string;
  responder_id: string;
  responder_name: string;
  content: string;
  created_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string;
}

export interface TaxCenter {
  id: string;
  name: string;
  location?: string;
}

export interface User {
  id?: string;
  uid: string;
  email: string;
  displayName?: string;
  name?: string; // For backward compatibility
  username?: string;
  role: UserRole;
  createdAt: string;
  tax_center_id?: string;
  tax_center_name?: string;
}

export interface ComplaintAssignment {
  id?: string;
  ASSIGN_ID: string;
  COMPLAINTS_ID: string;
  COMPLAINTS_CODE: string;
  COMPLAINTS_STATUS: string;
  USER_ID: string;
  ASSIGNED_DATE: string;
  ASSIGN_STATUS: string;
}

export interface ComplaintAssessment {
  id?: string;
  INITIAL_ID: string;
  COMPLAINTS_CODE: string;
  COMPLAINTS_ID: string;
  SENT_TO_DIRECTORATE: string;
  SENT_DATE: string;
  ACCEPTED_OFFICER: string;
  EXPLANATION_CONTENT: string;
  EXPLANATION_DATE: string;
  ASSESSMENT_STATUS: string;
  TAX_CENTER: string;
  SENT_TO_GROUP: string;
  SENT_TO_BRANCH: string;
  EXPLANATION_TOPICS: string;
  SENT_BY: string;
  ASSESSMENT_TYPE: string;
}
