import { Ticket, Agent, CategoryDetail, CRMContact } from './types';

export const SUPPORT_CATEGORIES: CategoryDetail[] = [
  {
    id: 'crm_config',
    title: 'CRM Setup & Customization',
    description: 'System layouts, custom fields, user roles, and core CRM workflow settings.',
    iconName: 'LayoutGrid',
    subCategories: [
      'Field customization & layout issues',
      'User roles & permissions mapping',
      'Workflow automation triggers not firing',
      'Dashboard widgets rendering error'
    ]
  },
  {
    id: 'lead_mgmt',
    title: 'Leads & Sales Pipeline',
    description: 'Lead generation tools, pipeline stage tracking, CSV import, and assignments.',
    iconName: 'Filter',
    subCategories: [
      'CSV lead import failing/mapping error',
      'Duplicate lead detection rule troubleshooting',
      'Automatic lead routing & assignment issues',
      'Pipeline stage visual update delay'
    ]
  },
  {
    id: 'call_analyzer',
    title: 'Call Analyzer & Dialer',
    description: 'VoIP calling setup, logs, recording access, and speech-to-text analytics.',
    iconName: 'PhoneCall',
    subCategories: [
      'SIP VoIP Trunk registration failed',
      'Call recording audio files not generating',
      'AI Speech-to-Text and Sentiment Analysis errors',
      'Interactive Voice Response (IVR) call routing issue'
    ]
  },
  {
    id: 'integrations',
    title: 'API & Integrations',
    description: 'Connecting third-party apps like WhatsApp API, Gmail, calendar, or webhooks.',
    iconName: 'Cpu',
    subCategories: [
      'WhatsApp Business API account verification',
      'Gmail/Outlook email sync disconnection',
      'Zapier & Make.com custom webhook failures',
      'External API payload mapping customization'
    ]
  },
  {
    id: 'billing_payment',
    title: 'Payments & Subscriptions',
    description: 'Licensing, plans, invoicing, upgrade queries, and payment processing.',
    iconName: 'CreditCard',
    subCategories: [
      'Transaction failed but bank account debited',
      'Upgrade current Trueline 365 license count',
      'Invoice tax details correction request',
      'Auto-renewal setup & cancellation terms'
    ]
  },
  {
    id: 'hrms_staff',
    title: 'HRMS & Staff Attendance',
    description: 'Attendance tracking, leave policy setup, payroll calculation, and recruitment.',
    iconName: 'Users',
    subCategories: [
      'Mobile App location check-in biometric error',
      'Staff leave balance calculation discrepancy',
      'Monthly Payroll calculation error',
      'Staff tracking & daily logs rendering issue'
    ]
  },
  {
    id: 'others',
    title: 'General Support & Others',
    description: 'Uncategorized inquiries, software demos, feature requests, or general help.',
    iconName: 'MoreHorizontal',
    subCategories: [
      'Request full system demo & training',
      'Submit new feature request / suggestion',
      'Report general performance bug',
      'Inquire about security compliance certification'
    ]
  }
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agt-101',
    name: 'Pooja Patel',
    email: 'pooja.patel@truelinesolution.com',
    role: 'Senior CRM Support Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online'
  },
  {
    id: 'agt-102',
    name: 'Heet Dhameliya',
    email: 'heet.dhameliya@truelinesolution.com',
    role: 'Technical Integration Lead',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online'
  },
  {
    id: 'agt-103',
    name: 'Vikram Shah',
    email: 'vikram.shah@truelinesolution.com',
    role: 'HRMS & Billing Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'busy'
  },
  {
    id: 'agt-104',
    name: 'Trueline Auto-Bot',
    email: 'support-bot@truelinesolution.com',
    role: 'AI Virtual Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online'
  }
];

export const MOCK_TICKETS: Ticket[] = [];

export const MOCK_CONTACTS: CRMContact[] = [
  { id: '1', name: 'Rajesh Mehta', company: 'Apex Corp', email: 'rajesh@apexcorp.in', phone: '+91 98765 43210', status: 'Hot Lead', value: '₹4,50,000' },
  { id: '2', name: 'Anjali Sharma', company: 'Vibrant Media', email: 'anjali@vibrantmedia.com', phone: '+91 91234 56789', status: 'Contacted', value: '₹12,00,000' },
  { id: '3', name: 'Karan Desai', company: 'Karan Solutions Pvt Ltd', email: 'accounts@karansolutions.com', phone: '+91 99988 77766', status: 'Proposal Sent', value: '₹3,20,000' },
  { id: '4', name: 'Dilip Gohel', company: 'Sardar Group', email: 'dilip.g@sardargroup.in', phone: '+91 94265 11223', status: 'Closed Won', value: '₹6,80,000' },
  { id: '5', name: 'Mitul Patel', company: 'Shree Hari Enterprise', email: 'mitul@shreehari.com', phone: '+91 98250 12345', status: 'New Lead', value: '₹1,50,000' },
];

export const QUICK_TEMPLATES = [
  'Hello! We have received your query regarding this issue. Our specialized engineering division is currently analyzing your backend server logs. We expect to share a concrete resolution update with you within the next 2-3 hours. Thank you for your patience.',
  'Dear Client, the reported network connection/configuration issue has been successfully rectified. We have verified the log transfers and VoIP trunk statuses on our core telemetry panels and they are running at optimal parameters. Kindly test it at your end and let us know if we can proceed to close this ticket.',
  'Thank you for providing the requested documentation. We have successfully registered your corrected company records and GSTIN details in our master billing card ledger. Your modified invoice is ready and has been dispatched to your registered billing email address.',
  'Hi there! It appears this issue is caused by a temporary disruption from the third-party API service gateway provider (e.g. Jio / Meta APIs). We have flagged this on their service status portal and are awaiting their official update. We will keep you updated.'
];
