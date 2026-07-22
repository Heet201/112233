export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketCategory = string;

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
  attachmentName?: string;
  attachmentSize?: string;
}

export interface Tenant {
  id: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  plan: 'Standard' | 'Premium' | 'Enterprise';
  status: 'active' | 'inactive';
  mrr: number; // monthly recurring revenue
  createdAt: string;
  // Public helpdesk styling & settings
  themeColor: 'blue' | 'emerald' | 'slate' | 'ruby' | 'orange';
  headline: string;
  subtitle: string;
  supportEmail: string;
  enableAttachments: boolean;
  logoText: string;
  customDomain?: string;
}

export interface Ticket {
  id: string; // e.g. "TL-4820"
  tenantId?: string; // Tenant separation id
  raisedToSaaS?: boolean; // True if raised by subscriber to SaaS super admins
  title: string;
  description: string;
  category: TicketCategory;
  subCategory: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  rating?: number;
  feedback?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface CategoryDetail {
  id: TicketCategory;
  title: string;
  description: string;
  iconName: string; // Lucide icon name string
  subCategories: string[];
}

export interface ActivityLog {
  id: string;
  ticketId: string;
  message: string;
  actor: string;
  createdAt: string;
}

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}
