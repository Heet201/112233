import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, TicketMessage, Agent, CategoryDetail, Tenant } from '../types';
import { MOCK_AGENTS, QUICK_TEMPLATES, MOCK_CONTACTS } from '../data';

interface AgentPortalProps {
  tickets: Ticket[];
  categories: CategoryDetail[];
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onUpdatePriority: (ticketId: string, priority: TicketPriority) => void;
  onAssignAgent: (ticketId: string, agentId: string) => void;
  onAddMessage: (ticketId: string, message: TicketMessage) => void;
  onLogout?: () => void;
  onAddCategory?: (newCategory: CategoryDetail) => void;
  selectedTicketIdProp?: string | null;
  onSelectTicketProp?: (id: string | null) => void;
  onCreateSaaSTicket?: (newTicket: Ticket) => void;
  tenant?: Tenant;
  allTenants?: Tenant[];
  initialInboxSource?: 'customer' | 'saas';
  isSuperAdmin?: boolean;
}

interface HelpCategory {
  id: string;
  title: string;
  iconName: string;
  subCategories: string[];
}

const SAAS_CATEGORIES: HelpCategory[] = [
  {
    id: 'crm_setup',
    title: 'CRM Setup & Customization',
    iconName: 'Settings',
    subCategories: [
      'Field customization & layout issues',
      'User roles & permissions mapping',
      'Workflow automation triggers not firing'
    ]
  },
  {
    id: 'leads_pipeline',
    title: 'Leads & Sales Pipeline',
    iconName: 'Sliders',
    subCategories: [
      'CSV lead import failing/mapping error',
      'Duplicate lead detection rule troubles',
      'Automatic lead routing & assignment failure'
    ]
  },
  {
    id: 'call_dialer',
    title: 'Call Analyzer & Dialer',
    iconName: 'PhoneCall',
    subCategories: [
      'SIP VoIP Trunk registration failed',
      'Call recording audio files not generated',
      'AI Speech-to-Text and Sentiment Analysis'
    ]
  },
  {
    id: 'api_integrations',
    title: 'API & Integrations',
    iconName: 'Code',
    subCategories: [
      'WhatsApp Business API account verification',
      'Gmail/Outlook email sync disconnected',
      'Zapier & Make.com custom webhook'
    ]
  },
  {
    id: 'payments_subscriptions',
    title: 'Payments & Subscriptions',
    iconName: 'Coins',
    subCategories: [
      'Transaction failed but bank account debited',
      'Upgrade current Trueline 365 license',
      'Invoice tax details correction request'
    ]
  },
  {
    id: 'hrms_attendance',
    title: 'HRMS & Staff Attendance',
    iconName: 'Database',
    subCategories: [
      'Mobile App location check-in biometrics',
      'Staff leave balance calculation discrepancy',
      'Monthly Payroll calculation error'
    ]
  },
  {
    id: 'general_support',
    title: 'General Support & Others',
    iconName: 'HelpCircle',
    subCategories: [
      'General query regarding platform roadmap',
      'SaaS partner program eligibility details',
      'Report general performance bug'
    ]
  }
];

export default function AgentPortal({
  tickets,
  categories,
  onUpdateStatus,
  onUpdatePriority,
  onAssignAgent,
  onAddMessage,
  onLogout,
  onAddCategory,
  selectedTicketIdProp,
  onSelectTicketProp,
  onCreateSaaSTicket,
  tenant,
  allTenants,
  initialInboxSource = 'customer',
  isSuperAdmin = false
}: AgentPortalProps) {
  // Navigation & filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'queue' | 'categories'>(() => {
    return (localStorage.getItem('trueline_agent_subtab') as 'queue' | 'categories') || 'queue';
  });

  // Dual-stream toggle (just like SuperAdminPortal)
  const [inboxSource, setInboxSource] = useState<'customer' | 'saas'>(initialInboxSource);

  useEffect(() => {
    if (initialInboxSource) {
      setInboxSource(initialInboxSource);
    }
  }, [initialInboxSource]);

  // SaaS ticket raising flow states inside Subscriber Support Desk
  const [isRaisingSaaS, setIsRaisingSaaS] = useState(false);
  const [selectedSaaSCategory, setSelectedSaaSCategory] = useState<HelpCategory | null>(null);
  const [selectedSaaSSubCategory, setSelectedSaaSSubCategory] = useState('');
  const [saasSubject, setSaasSubject] = useState('');
  const [saasPriority, setSaasPriority] = useState<TicketPriority>('medium');
  const [saasDescription, setSaasDescription] = useState('');
  const [saasFormSuccess, setSaasFormSuccess] = useState('');

  // Category Form State
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('LayoutGrid');
  const [newCatSubInput, setNewCatSubInput] = useState('');
  const [newCatSubs, setNewCatSubs] = useState<string[]>([]);
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');
  
  // Active Management Ticket State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => {
    return localStorage.getItem('trueline_agent_selected_ticket_id');
  });
  const [agentReply, setAgentReply] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Stats calculation - scoped to the currently active stream
  const streamTickets = tickets.filter(t => inboxSource === 'saas' ? t.raisedToSaaS : !t.raisedToSaaS);
  const totalTickets = streamTickets.length;
  const openTickets = streamTickets.filter(t => t.status === 'open').length;
  const inProgressTickets = streamTickets.filter(t => t.status === 'in_progress').length;
  const pendingTickets = streamTickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = streamTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  
  // Calculate average rating
  const ratedTickets = streamTickets.filter(t => t.rating !== undefined);
  const averageRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTickets.length).toFixed(1)
    : '4.9';

  // SLA Met calculation (mocked based on rating or state)
  const slaMetPercentage = totalTickets > 0 
    ? Math.round(((resolvedTickets + inProgressTickets) / totalTickets) * 100) 
    : 98;

  // Filter tickets for workspace list
  const filteredTickets = tickets.filter(tkt => {
    const matchesSource = inboxSource === 'saas' ? tkt.raisedToSaaS : !tkt.raisedToSaaS;
    const matchesTenant = tenantFilter === 'all' || !tkt.tenantId || tkt.tenantId.toLowerCase() === tenantFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || tkt.status === statusFilter;
    const matchesSearch = 
      tkt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tkt.customerEmail && tkt.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tkt.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesTenant && matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-[#605e5c] bg-[#f3f2f1] border-[#edebe9]';
      case 'medium': return 'text-[#0078d4] bg-[#f3f2f1] border-[#0078d4]/10';
      case 'high': return 'text-[#d83b01] bg-[#fffdf0] border-[#d83b01]/10';
      case 'critical': return 'text-[#d13438] bg-[#fff1f1] border-[#d13438]/15 animate-pulse font-bold';
      default: return 'text-[#605e5c] bg-[#f3f2f1]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-[#d13438] bg-[#fff1f1] border-[#d13438]/10';
      case 'in_progress': return 'text-[#ffb900] bg-[#fffdf0] border-[#ffb900]/10 font-sans';
      case 'pending': return 'text-[#0078d4] bg-[#f3f2f1] border-[#0078d4]/10';
      case 'resolved': return 'text-[#107c10] bg-[#f1faf1] border-[#107c10]/20';
      case 'closed': return 'text-[#605e5c] bg-[#f3f2f1] border-[#edebe9]';
      default: return 'text-[#605e5c] bg-[#f3f2f1]';
    }
  };

  const handleSendAgentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReply.trim() || !selectedTicketId) return;

    const isSaaSTicket = activeTicket?.raisedToSaaS;

    // Sender role:
    // If isSuperAdmin is true: SaaS Super Admin responding -> sender is 'agent'
    // If isSuperAdmin is false:
    //   If SaaS ticket (raisedToSaaS) -> Subscriber responding -> sender is 'customer'
    //   If standard client ticket -> Tenant Agent responding -> sender is 'agent'
    const senderRole: 'agent' | 'customer' = isSuperAdmin
      ? 'agent'
      : (isSaaSTicket ? 'customer' : 'agent');

    const senderDisplayName = isSuperAdmin
      ? 'SaaS Super Admin (365 CRM)'
      : (isSaaSTicket 
          ? `${tenant?.ownerName || 'Company Admin'} (${tenant?.companyName || 'Subscriber'})`
          : 'Heet Dhameliya (CRM Lead)');

    // Send the reply
    const reply: TicketMessage = {
      id: `msg-${senderRole}-${Date.now()}`,
      sender: senderRole,
      senderName: senderDisplayName,
      message: agentReply.trim(),
      createdAt: new Date().toISOString()
    };

    onAddMessage(selectedTicketId, reply);
    setAgentReply('');
    setSelectedTemplate('');

    if (activeTicket && activeTicket.status === 'open') {
      onUpdateStatus(selectedTicketId, 'in_progress');
    }
  };

  const handleSubmitSaaSTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saasSubject.trim() || !saasDescription.trim() || !tenant) return;

    const ticketId = `SAAS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: ticketId,
      tenantId: tenant.id,
      raisedToSaaS: true,
      title: saasSubject,
      description: saasDescription,
      category: selectedSaaSCategory?.title || 'SaaS Platform Support Request',
      subCategory: selectedSaaSSubCategory || 'SaaS Platform Support Request',
      status: 'open',
      priority: saasPriority,
      customerName: tenant.ownerName || 'Company Administrator',
      customerEmail: tenant.ownerEmail || 'admin@tenant.com',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'customer',
          senderName: `${tenant.ownerName} (${tenant.companyName})`,
          message: saasDescription,
          createdAt: now
        }
      ]
    };

    if (onCreateSaaSTicket) {
      onCreateSaaSTicket(newTicket);
    }
    setSaasSubject('');
    setSaasDescription('');
    setIsRaisingSaaS(false);
    setSelectedSaaSCategory(null);
    setSelectedSaaSSubCategory('');
    setSaasFormSuccess('Your support ticket has been successfully raised to the SaaS platform team!');
    setTimeout(() => setSaasFormSuccess(''), 4000);
    setSelectedTicketId(ticketId); // Select the newly raised ticket
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    if (val) {
      setAgentReply(val);
    }
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId);
  const activeClientCRM = activeTicket ? MOCK_CONTACTS.find(c => c.email === activeTicket.customerEmail) : null;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages?.length]);

  useEffect(() => {
    localStorage.setItem('trueline_agent_subtab', subTab);
  }, [subTab]);

  useEffect(() => {
    if (selectedTicketId) {
      localStorage.setItem('trueline_agent_selected_ticket_id', selectedTicketId);
    } else {
      localStorage.removeItem('trueline_agent_selected_ticket_id');
    }
    if (onSelectTicketProp) {
      onSelectTicketProp(selectedTicketId);
    }
  }, [selectedTicketId, onSelectTicketProp]);

  useEffect(() => {
    if (selectedTicketIdProp !== undefined && selectedTicketIdProp !== selectedTicketId) {
      setSelectedTicketId(selectedTicketIdProp);
    }
  }, [selectedTicketIdProp]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f2f1] font-sans text-[#323130]">
      
      {/* Agent Top Header */}
      <div className="bg-white border-b border-[#edebe9] px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#323130] flex items-center gap-2">
            <Lucide.ShieldAlert className="text-[#0078d4]" size={18} />
            Trueline Solutions Support Desk
          </h1>
          <p className="text-xs text-[#605e5c] font-medium">Internal CRM Agent Workspace Panel</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Active Agent Profile Widget */}
          <div className="flex items-center gap-2 bg-[#f3f2f1] p-1.5 pr-3 rounded-sm border border-[#edebe9]">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80"
              alt="Agent Avatar"
              className="w-7 h-7 rounded-sm object-cover shadow-sm border border-white"
            />
            <div className="text-left leading-none">
              <span className="text-[11px] font-bold text-[#323130] block">Heet Dhameliya</span>
              <span className="text-[9px] font-semibold text-[#0078d4] block">SLA Compliance Officer</span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-[#fff1f1] hover:bg-[#ffe2e2] text-[#d13438] font-bold text-xs px-3 py-1.5 rounded-sm border border-[#d13438]/10 shadow-sm cursor-pointer transition-colors"
              title="Logout from CRM"
            >
              <Lucide.LogOut size={13} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation */}
      {!selectedTicketId && (
        <div className="bg-white border-b border-[#edebe9] px-6 flex items-center justify-start gap-4 shrink-0">
          <button
            onClick={() => setSubTab('queue')}
            className={`py-3 text-xs font-bold border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'queue'
                ? 'border-[#0078d4] text-[#0078d4]'
                : 'border-transparent text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            <Lucide.Layers size={14} />
            <span>Ticket Queue & Diagnostics</span>
          </button>
          <button
            onClick={() => setSubTab('categories')}
            className={`py-3 text-xs font-bold border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'categories'
                ? 'border-[#0078d4] text-[#0078d4]'
                : 'border-transparent text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            <Lucide.Tag size={14} />
            <span>Manage Issue Categories</span>
            <span className="bg-[#f3f2f1] text-[#323130] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#edebe9]">
              {categories.length}
            </span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!selectedTicketId ? (
          subTab === 'queue' ? (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              {saasFormSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-sm flex items-center gap-1.5 shadow-xs">
                  <Lucide.CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>{saasFormSuccess}</span>
                </div>
              )}

              {isRaisingSaaS ? (
                /* FULL PAGE RAISE TICKET VIEW */
                !selectedSaaSCategory ? (
                  /* STEP 1: SELECT HELP CATEGORY (Matches Screenshot 2!) */
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-[#edebe9]">
                      <div>
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                          SELECT HELP CATEGORY
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Select a category below to route your support ticket to the SaaS Super Admin squad.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsRaisingSaaS(false);
                          setSelectedSaaSCategory(null);
                        }}
                        className="bg-white border border-[#edebe9] hover:bg-slate-100 text-[#323130] font-bold text-xs px-3 py-1.5 rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Lucide.ArrowLeft size={13} />
                        <span>Back to Support Logs</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {SAAS_CATEGORIES.map((cat) => {
                        const IconComp = (Lucide as any)[cat.iconName] || Lucide.HelpCircle;
                        return (
                          <div
                            key={cat.id}
                            className="bg-white border border-[#edebe9] rounded-sm shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#0078d4] hover:shadow-sm transition-all"
                          >
                            <div className="p-5 space-y-3">
                              {/* Category Header */}
                              <div className="flex items-center gap-3 border-b border-[#f3f2f1] pb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0078d4] flex items-center justify-center shrink-0 border border-blue-100">
                                  <IconComp size={16} />
                                </div>
                                <h3 className="font-bold text-[#323130] text-sm leading-snug">{cat.title}</h3>
                              </div>

                              {/* Subcategories list */}
                              <div className="space-y-1 pt-1">
                                {cat.subCategories.map((subItem) => (
                                  <button
                                    key={subItem}
                                    onClick={() => {
                                      setSelectedSaaSCategory(cat);
                                      setSelectedSaaSSubCategory(subItem);
                                    }}
                                    className="w-full text-left py-2 px-2.5 rounded-xs hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors border-b border-dashed border-[#f3f2f1] last:border-0"
                                  >
                                    <span className="text-xs text-[#605e5c] group-hover:text-[#0078d4] font-medium line-clamp-1">
                                      {subItem}
                                    </span>
                                    <Lucide.ChevronRight size={13} className="text-gray-300 group-hover:text-[#0078d4] shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Bottom View All Link */}
                            <button
                              onClick={() => {
                                setSelectedSaaSCategory(cat);
                                setSelectedSaaSSubCategory(cat.subCategories[0]);
                              }}
                              className="w-full py-3 px-5 border-t border-[#f3f2f1] text-[10px] font-extrabold text-[#0078d4] hover:bg-blue-50/50 uppercase tracking-wider flex items-center justify-between group transition-colors cursor-pointer bg-[#fafafa]"
                            >
                              <span>VIEW ALL UNDER {cat.title.toUpperCase()}</span>
                              <Lucide.ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* STEP 2: TICKET FORM */
                  <div className="bg-white border border-[#edebe9] rounded-sm shadow-sm max-w-3xl mx-auto overflow-hidden">
                    <div className="p-5 border-b border-[#edebe9] bg-[#f8f8f8] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSaaSCategory(null)}
                          className="p-1.5 hover:bg-slate-200 rounded-sm text-[#0078d4] cursor-pointer transition-colors"
                          title="Back to Categories"
                        >
                          <Lucide.ChevronLeft size={18} />
                        </button>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Help Category</span>
                          <h3 className="text-sm font-bold text-slate-800">{selectedSaaSCategory.title}</h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRaisingSaaS(false);
                          setSelectedSaaSCategory(null);
                        }}
                        className="text-xs font-bold text-[#605e5c] hover:text-[#323130] flex items-center gap-1 cursor-pointer"
                      >
                        <Lucide.X size={15} />
                        <span>Cancel</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmitSaaSTicket} className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">Issue Severity</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map((p) => (
                              <button
                                type="button"
                                key={p}
                                onClick={() => setSaasPriority(p)}
                                className={`py-2 text-[10px] uppercase font-bold border rounded-sm transition-all cursor-pointer ${
                                  saasPriority === p
                                    ? 'bg-[#0078d4] text-white border-[#0078d4] shadow-xs'
                                    : 'bg-white text-slate-600 border-[#edebe9] hover:bg-slate-50'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">Routing Classification</label>
                          <select
                            value={selectedSaaSSubCategory}
                            onChange={(e) => setSelectedSaaSSubCategory(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#0078d4] bg-white font-medium cursor-pointer"
                          >
                            {selectedSaaSCategory.subCategories.map((sub: string) => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">Brief Subject Summary *</label>
                        <input
                          type="text"
                          required
                          value={saasSubject}
                          onChange={(e) => setSaasSubject(e.target.value)}
                          placeholder="e.g., Unable to sync WhatsApp Business API gateway..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-sm focus:outline-none focus:border-[#0078d4] bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">Detailed Explanation *</label>
                        <textarea
                          required
                          value={saasDescription}
                          onChange={(e) => setSaasDescription(e.target.value)}
                          placeholder="Provide complete details for SaaS engineering support..."
                          rows={5}
                          className="w-full text-xs p-3 border border-slate-300 rounded-sm focus:outline-none focus:border-[#0078d4] bg-white font-sans"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#edebe9] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSaaSCategory(null);
                            setIsRaisingSaaS(false);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Lucide.Send size={13} />
                          <span>Raise Support Ticket to SaaS</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : (
                /* KPI Telemetry Cards */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-l-[#0078d4] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[#605e5c]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Total Filed Tickets</span>
                        <Lucide.Ticket size={16} className="text-[#0078d4]" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#323130]">{totalTickets}</span>
                        <span className="text-[10px] text-[#107c10] font-semibold">100% Volume</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-l-[#d13438] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[#605e5c]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting (Open)</span>
                        <Lucide.AlertCircle size={16} className="text-[#d13438]" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#d13438] animate-pulse">{openTickets}</span>
                        <span className="text-[10px] text-[#605e5c] font-medium">{totalTickets ? Math.round((openTickets / totalTickets) * 100) : 0}% of total</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-l-[#ffb900] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[#605e5c]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">In Investigation</span>
                        <Lucide.LoaderCircle size={16} className="text-[#ffb900] animate-spin" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#ffb900] font-sans">{inProgressTickets}</span>
                        <span className="text-[10px] text-[#ffb900] font-medium">Active CRM</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-l-[#107c10] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[#605e5c]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Resolved Tickets</span>
                        <Lucide.CheckCircle size={16} className="text-[#107c10]" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#107c10]">{resolvedTickets}</span>
                        <span className="text-[10px] text-[#107c10] font-bold">Resolved Logs</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-l-[#ffb900] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[#605e5c]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">CSAT Rating</span>
                        <div className="flex items-center text-[#ffb900] gap-0.5">
                          <Lucide.Star size={12} fill="#ffb900" className="text-[#ffb900]" />
                          <span className="text-[10px] font-bold text-[#ffb900]">{averageRating}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#ffb900]">{averageRating} <span className="text-xs text-[#605e5c]">/ 5</span></span>
                        <span className="text-[10px] text-[#107c10] font-semibold">Excellent</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom SVG Data Visualizations */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category distribution bar chart */}
                    <div className="bg-white p-5 rounded-sm border border-[#edebe9] shadow-sm lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="font-bold text-[#323130] text-sm">Ticket Volume Category Distribution</h3>
                        <p className="text-xs text-[#605e5c]">Real-time counts of issues per CRM system module</p>
                      </div>
                      
                      <div className="space-y-3.5">
                        {categories.map((cat) => {
                          const count = tickets.filter(t => t.category === cat.id).length;
                          const pct = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                          return (
                            <div key={cat.id} className="space-y-1 text-xs">
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-[#605e5c] flex items-center gap-1.5">
                                  {cat.title === 'General Support & Others' ? 'General Support' : cat.title}
                                </span>
                                <span className="text-[#323130]">{count} Tickets <span className="text-[10px] text-[#605e5c] font-normal">({Math.round(pct)}%)</span></span>
                              </div>
                              {/* Custom horizontal bar */}
                              <div className="w-full bg-[#f3f2f1] h-2.5 rounded-sm overflow-hidden border border-[#edebe9]">
                                <div 
                                  className="bg-[#0078d4] h-full rounded-sm transition-all duration-500" 
                                  style={{ width: `${pct || 2}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Breakdown Segment Ring */}
                    <div className="bg-white p-5 rounded-sm border border-[#edebe9] shadow-sm space-y-4">
                      <div>
                        <h3 className="font-bold text-[#323130] text-sm">Real-time Resolution Slicing</h3>
                        <p className="text-xs text-[#605e5c]">SLA performance status tracking</p>
                      </div>

                      <div className="flex flex-col items-center justify-center py-4 relative">
                        {/* Outer SVG Segment Wheel */}
                        <svg className="w-32 h-32" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f2f1" strokeWidth="3" />
                          
                          {/* Resolved Arc (green) */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#107c10" strokeWidth="3" 
                            strokeDasharray={`${totalTickets ? (resolvedTickets / totalTickets) * 100 : 0} ${totalTickets ? 100 - (resolvedTickets / totalTickets) * 100 : 100}`}
                            strokeDashoffset="25" 
                          />
                          
                          {/* Open/Awaiting Arc (pink) */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d13438" strokeWidth="3" 
                            strokeDasharray={`${totalTickets ? (openTickets / totalTickets) * 100 : 0} ${totalTickets ? 100 - (openTickets / totalTickets) * 100 : 100}`}
                            strokeDashoffset={`${25 - (totalTickets ? (resolvedTickets / totalTickets) * 100 : 0)}`} 
                          />

                          {/* In Progress Arc (amber) */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffb900" strokeWidth="3" 
                            strokeDasharray={`${totalTickets ? (inProgressTickets / totalTickets) * 100 : 0} ${totalTickets ? 100 - (inProgressTickets / totalTickets) * 100 : 100}`}
                            strokeDashoffset={`${25 - (totalTickets ? ((resolvedTickets + openTickets) / totalTickets) * 100 : 0)}`} 
                          />
                        </svg>
                        
                        {/* Centered label */}
                        <div className="absolute text-center leading-none">
                          <span className="text-xl font-black text-[#323130] block">{slaMetPercentage}%</span>
                          <span className="text-[8px] font-bold text-[#605e5c] uppercase tracking-widest block">SLA MET</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                        <div className="flex items-center gap-1.5 font-semibold text-[#605e5c]">
                          <span className="w-2 h-2 rounded-sm bg-[#107c10] block"></span>
                          <span>Resolved ({resolvedTickets})</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#605e5c]">
                          <span className="w-2 h-2 rounded-sm bg-[#d13438] block"></span>
                          <span>Awaiting ({openTickets})</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#605e5c]">
                          <span className="w-2 h-2 rounded-sm bg-[#ffb900] block"></span>
                          <span>Working ({inProgressTickets})</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#605e5c]">
                          <span className="w-2 h-2 rounded-sm bg-[#0078d4] block"></span>
                          <span>Pending ({pendingTickets})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Management Workspace Grid / Table */}
                  <div className="bg-white rounded-sm border border-[#edebe9] shadow-sm overflow-hidden">
                    {/* Filter controls bar */}
                    <div className="p-4 bg-[#f8f8f8] border-b border-[#edebe9] flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Support Stream Toggle */}
                        <div className="flex items-center p-0.5 bg-slate-200 rounded-sm border border-slate-300">
                          <button
                            onClick={() => {
                              setInboxSource('customer');
                              setStatusFilter('all');
                              setIsRaisingSaaS(false);
                            }}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                              inboxSource === 'customer'
                                ? 'bg-[#0078d4] text-white shadow-xs'
                                : 'text-[#605e5c] hover:text-[#323130]'
                            }`}
                          >
                            <Lucide.Users size={12} />
                            <span>My Clients Queue</span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[8px] leading-none ${inboxSource === 'customer' ? 'bg-[#106ebe] text-white font-extrabold' : 'bg-slate-300 text-[#323130]'}`}>
                              {tickets.filter(t => !t.raisedToSaaS).length}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setInboxSource('saas');
                              setStatusFilter('all');
                            }}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                              inboxSource === 'saas'
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'text-[#605e5c] hover:text-[#323130]'
                            }`}
                          >
                            <Lucide.LifeBuoy size={12} />
                            <span>SaaS Support Logs</span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[8px] leading-none ${inboxSource === 'saas' ? 'bg-purple-800 text-white font-extrabold' : 'bg-slate-300 text-[#323130]'}`}>
                              {tickets.filter(t => t.raisedToSaaS).length}
                            </span>
                          </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-64">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Ticket ID, Name, Keyword..."
                            className="w-full bg-white border border-[#edebe9] rounded-sm pl-9 pr-3 py-1.5 text-xs text-[#323130] focus:outline-none focus:ring-1 focus:ring-[#0078d4] focus:border-[#0078d4]"
                          />
                          <Lucide.Search className="absolute left-3 top-2.5 text-[#605e5c]" size={13} />
                        </div>

                        {/* Tenant Dropdown Filter */}
                        <div>
                          <select
                            value={tenantFilter}
                            onChange={(e) => setTenantFilter(e.target.value)}
                            className="bg-white border border-[#edebe9] rounded-sm px-2.5 py-1.5 text-xs font-bold text-[#0078d4] focus:outline-none focus:ring-1 focus:ring-[#0078d4] cursor-pointer"
                          >
                            <option value="all">🏢 Tenant: All Queues</option>
                            {allTenants && allTenants.map(tn => (
                              <option key={tn.id} value={tn.id}>
                                🏢 {tn.companyName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status Dropdown */}
                        <div>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-[#edebe9] rounded-sm px-2.5 py-1.5 text-xs font-semibold text-[#605e5c] focus:outline-none focus:ring-1 focus:ring-[#0078d4] cursor-pointer"
                          >
                            <option value="all">Status: All</option>
                            <option value="open">Status: Open / Awaiting</option>
                            <option value="in_progress">Status: In Progress</option>
                            <option value="pending">Status: Pending Agent</option>
                            <option value="resolved">Status: Resolved</option>
                            <option value="closed">Status: Closed</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {inboxSource === 'saas' && !isRaisingSaaS && (
                          <button
                            onClick={() => setIsRaisingSaaS(true)}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-sm shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Lucide.Plus size={13} />
                            <span>Raise Support Ticket to SaaS</span>
                          </button>
                        )}
                        <div className="text-xs text-[#323130] font-semibold">
                          Showing <strong className="text-[#d13438]">{filteredTickets.length}</strong> of {tickets.filter(t => inboxSource === 'saas' ? t.raisedToSaaS : !t.raisedToSaaS).length} tickets
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {filteredTickets.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 space-y-3">
                          <Lucide.ShieldAlert size={40} className="mx-auto text-slate-300" />
                          <div>
                            <h4 className="font-bold text-slate-700 text-xs">No active tickets found</h4>
                            <p className="text-[11px] max-w-sm mx-auto mt-1">There are no tickets in this stream folder matching your filters or keywords.</p>
                          </div>
                          {inboxSource === 'saas' && (
                            <button
                              onClick={() => setIsRaisingSaaS(true)}
                              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-sm shadow-sm transition-colors cursor-pointer mt-2"
                            >
                              Raise Support Ticket to SaaS
                            </button>
                          )}
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f8f8f8] text-[10px] font-bold text-[#605e5c] uppercase tracking-wider border-b border-[#edebe9]">
                              <th className="p-4 w-28 pl-4">Ticket ID</th>
                              <th className="p-4">Customer/Sender</th>
                              <th className="p-4">Reported Issue Details</th>
                              <th className="p-4">Assigned To</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 pr-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f3f2f1]">
                            {filteredTickets.map((tkt) => {
                              const assignedAgent = MOCK_AGENTS.find(a => a.id === tkt.assignedAgentId);
                              return (
                                <tr key={tkt.id} className="hover:bg-[#f9f9f9] transition-colors">
                                  <td className="p-4 font-mono font-bold text-[#0078d4] pl-4">{tkt.id}</td>
                                  <td className="p-4">
                                    <div>
                                      <p className="font-bold text-[#323130] text-sm">{tkt.customerName}</p>
                                      <p className="text-[10px] text-[#605e5c] mt-0.5">{tkt.customerEmail}</p>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="max-w-xs md:max-w-md">
                                      <p className="font-bold text-[#323130] truncate">{tkt.title}</p>
                                      <p className="text-[10px] text-[#605e5c] truncate mt-0.5">{tkt.description}</p>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      {tkt.raisedToSaaS ? (
                                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-sm">SaaS Owner Team</span>
                                      ) : assignedAgent ? (
                                        <>
                                          <img
                                            src={assignedAgent.avatar}
                                            alt={assignedAgent.name}
                                            className="w-5.5 h-5.5 rounded-sm object-cover border border-[#edebe9]"
                                          />
                                          <span className="font-semibold text-[#605e5c] text-xs">{assignedAgent.name.split(' ')[0]}</span>
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-[#d13438] font-bold bg-[#fff1f1] border border-[#d13438]/10 px-2 py-0.5 rounded-sm">UNASSIGNED</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border ${getStatusColor(tkt.status)}`}>
                                      {tkt.status}
                                    </span>
                                  </td>
                                  <td className="p-4 pr-4 text-center">
                                    <button
                                      onClick={() => setSelectedTicketId(tkt.id)}
                                      className="bg-[#0078d4] hover:bg-[#106ebe] text-white font-extrabold text-[11px] px-3 py-1.5 rounded-sm shadow-sm cursor-pointer transition-colors"
                                    >
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Manage Categories Screen */
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#323130] flex items-center gap-2">
                    <Lucide.Tags className="text-[#0078d4]" size={18} />
                    Operational Ticket Categories
                  </h2>
                  <p className="text-xs text-[#605e5c]">Configure CRM support queue routes, issue classifications, and helpdesk icons.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: List of current categories */}
                <div className="lg:col-span-2 space-y-4">
                  {categories.map((cat) => {
                    const IconComp = (Lucide as any)[cat.iconName] || Lucide.HelpCircle;
                    const ticketCount = tickets.filter(t => t.category === cat.id).length;
                    return (
                      <div key={cat.id} className="bg-white border border-[#edebe9] rounded-sm p-5 shadow-sm space-y-4 hover:border-[#0078d4]/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-[#f3f2f1] text-[#0078d4] flex items-center justify-center border border-[#edebe9] shrink-0">
                              <IconComp size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-[#323130] flex items-center gap-2 flex-wrap">
                                <span>{cat.title}</span>
                                <span className="text-[9px] font-mono font-bold text-[#605e5c] bg-[#f3f2f1] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">ID: {cat.id}</span>
                              </h3>
                              <p className="text-xs text-[#605e5c] mt-0.5">{cat.description}</p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span className="bg-[#0078d4]/10 text-[#0078d4] text-[10px] font-extrabold px-2.5 py-1 rounded-sm border border-[#0078d4]/10 whitespace-nowrap">
                              {ticketCount} Tickets
                            </span>
                          </div>
                        </div>

                        {/* Subcategories list */}
                        <div className="border-t border-[#edebe9] pt-3">
                          <span className="text-[10px] uppercase font-bold text-[#605e5c] block mb-2 tracking-wide">Configured Issue Classifications ({cat.subCategories.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.subCategories.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">No specific classifications configured. Tickets will route generally.</span>
                            ) : (
                              cat.subCategories.map((sub, idx) => (
                                <span key={idx} className="bg-[#f3f2f1] text-[#323130] text-[10px] font-semibold px-2 py-1 rounded-sm border border-[#edebe9]">
                                  {sub}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Add New Category Form */}
                <div className="bg-white border border-[#edebe9] rounded-sm p-5 shadow-sm space-y-4 h-fit">
                  <div>
                    <h3 className="font-bold text-sm text-[#323130] flex items-center gap-1.5">
                      <Lucide.PlusCircle size={16} className="text-[#107c10]" />
                      Create Dynamic Category
                    </h3>
                    <p className="text-xs text-[#605e5c]">Deploy a brand new support routing classification instantly.</p>
                  </div>

                  {catError && (
                    <div className="p-3 bg-[#fff1f1] border border-[#d13438]/20 text-[#d13438] text-xs font-semibold rounded-sm">
                      ⚠️ {catError}
                    </div>
                  )}

                  {catSuccess && (
                    <div className="p-3 bg-[#f3fdf3] border border-[#107c10]/20 text-[#107c10] text-xs font-semibold rounded-sm">
                      🎉 {catSuccess}
                    </div>
                  )}

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setCatError('');
                    setCatSuccess('');

                    if (!newCatTitle.trim()) {
                      setCatError('Category Title is required.');
                      return;
                    }

                    const generatedId = newCatId.trim() || newCatTitle.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
                    if (!generatedId) {
                      setCatError('Could not generate a valid Category ID. Please provide one manually.');
                      return;
                    }

                    if (categories.some(c => c.id === generatedId)) {
                      setCatError(`Category ID "${generatedId}" already exists. Use a unique title or ID.`);
                      return;
                    }

                    const newCategory: CategoryDetail = {
                      id: generatedId,
                      title: newCatTitle.trim(),
                      description: newCatDesc.trim() || 'No description provided.',
                      iconName: newCatIcon,
                      subCategories: newCatSubs
                    };

                    if (onAddCategory) {
                      onAddCategory(newCategory);
                      setCatSuccess('Category successfully created and deployed!');
                      // Reset form
                      setNewCatTitle('');
                      setNewCatId('');
                      setNewCatDesc('');
                      setNewCatIcon('LayoutGrid');
                      setNewCatSubs([]);
                    } else {
                      setCatError('Save callback error. Refresh and try again.');
                    }
                  }} className="space-y-4 text-xs">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#323130] uppercase">Category Title *</label>
                      <input
                        type="text"
                        required
                        value={newCatTitle}
                        onChange={(e) => {
                          setNewCatTitle(e.target.value);
                          // Auto-generate ID on the fly
                          setNewCatId(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, ''));
                        }}
                        placeholder="e.g., Database & Backups"
                        className="w-full bg-white border border-[#edebe9] px-3 py-2 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                      />
                    </div>

                    {/* Unique ID */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#323130] uppercase">Unique Routing ID (Slug)</label>
                      <input
                        type="text"
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_'))}
                        placeholder="e.g., db_backups"
                        className="w-full bg-white border border-[#edebe9] px-3 py-2 font-mono text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                      />
                      <span className="text-[9px] text-[#605e5c] block">Must be unique, lowercase letters and underscores only.</span>
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#323130] uppercase">Icon Style Selection</label>
                      <div className="grid grid-cols-5 gap-1.5 bg-[#f3f2f1] p-2 rounded-sm border border-[#edebe9]">
                        {[
                          { name: 'LayoutGrid', label: 'Grid' },
                          { name: 'Filter', label: 'Funnel' },
                          { name: 'PhoneCall', label: 'Dialer' },
                          { name: 'Cpu', label: 'API' },
                          { name: 'CreditCard', label: 'Billing' },
                          { name: 'Users', label: 'Users' },
                          { name: 'Settings', label: 'Settings' },
                          { name: 'Activity', label: 'Activity' },
                          { name: 'Database', label: 'DB' },
                          { name: 'Mail', label: 'Email' }
                        ].map((ico) => {
                          const IconComponent = (Lucide as any)[ico.name] || Lucide.HelpCircle;
                          const isSelected = newCatIcon === ico.name;
                          return (
                            <button
                              type="button"
                              key={ico.name}
                              onClick={() => setNewCatIcon(ico.name)}
                              title={ico.label}
                              className={`p-2 flex flex-col items-center justify-center rounded-sm border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#0078d4] text-white border-[#0078d4]' 
                                  : 'bg-white hover:bg-[#edebe9] text-[#605e5c] border-[#edebe9]'
                              }`}
                            >
                              <IconComponent size={14} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#323130] uppercase">Description</label>
                      <textarea
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Describe what kind of tickets will be classified here."
                        rows={2}
                        className="w-full bg-white border border-[#edebe9] px-3 py-2 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4] resize-none"
                      />
                    </div>

                    {/* Subcategories (Classifications) Interactive List Builder */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#323130] uppercase">Add Classifications (Subcategories)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newCatSubInput}
                          onChange={(e) => setNewCatSubInput(e.target.value)}
                          placeholder="e.g., Backup Restore Failure"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCatSubInput.trim()) {
                                if (!newCatSubs.includes(newCatSubInput.trim())) {
                                  setNewCatSubs([...newCatSubs, newCatSubInput.trim()]);
                                }
                                setNewCatSubInput('');
                              }
                            }
                          }}
                          className="flex-1 bg-white border border-[#edebe9] px-3 py-2 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCatSubInput.trim()) {
                              if (!newCatSubs.includes(newCatSubInput.trim())) {
                                setNewCatSubs([...newCatSubs, newCatSubInput.trim()]);
                              }
                              setNewCatSubInput('');
                            }
                          }}
                          className="bg-[#0078d4] hover:bg-[#106ebe] text-white px-3 text-xs font-bold rounded-sm cursor-pointer transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 bg-[#f8f8f8] p-2 rounded-sm border border-[#edebe9] min-h-[36px]">
                        {newCatSubs.length === 0 ? (
                          <span className="text-[10px] text-gray-400 italic self-center pl-1">Press enter or click Add to append subcategories.</span>
                        ) : (
                          newCatSubs.map((sub) => (
                            <span key={sub} className="bg-white border border-[#edebe9] text-[#323130] text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1.5 shadow-sm">
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => setNewCatSubs(newCatSubs.filter(s => s !== sub))}
                                className="text-red-500 font-bold hover:text-red-700 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#107c10] hover:bg-[#0b5a0b] text-white font-bold py-2.5 text-xs rounded-sm shadow-sm transition-colors cursor-pointer"
                    >
                      ➕ Deploy Category
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Detailed Ticket Triage Workspace Screen */
          <div className="h-full flex flex-col md:flex-row overflow-hidden bg-white">
            
            {/* Left side: Live chat with standard templates and reply boxes */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#edebe9]">
              
              {/* Actions Header */}
              <div className="p-4 border-b border-[#edebe9] bg-[#f8f8f8] flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    setSelectedTicketId(null);
                    setAgentReply('');
                    setSelectedTemplate('');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#605e5c] hover:text-[#0078d4] cursor-pointer"
                >
                  <Lucide.ArrowLeft size={15} />
                  Back to Queue
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0078d4] text-xs">{activeTicket?.id}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border ${activeTicket ? getStatusColor(activeTicket.status) : ''}`}>
                    {activeTicket?.status}
                  </span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f3f2f1]">
                {activeTicket && (
                  <>
                    {/* Primary client description */}
                    <div className="bg-white border border-[#edebe9] rounded-sm p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#605e5c] uppercase">Reported Issue Narrative</span>
                        <span className="text-[10px] text-[#605e5c] font-semibold">{new Date(activeTicket.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="font-bold text-[#323130] text-base">{activeTicket.title}</h3>
                      <p className="text-xs text-[#605e5c] leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>
                    </div>

                    {/* Messages */}
                    {activeTicket.messages.map((msg) => {
                      if (msg.sender === 'system') {
                        return (
                          <div key={msg.id} className="flex justify-center my-1">
                            <span className="bg-white border border-[#edebe9] text-[#605e5c] text-[10px] font-bold px-3 py-1 rounded-sm text-center shadow-sm">
                              🛠️ {msg.message}
                            </span>
                          </div>
                        );
                      }

                      // Determine if message is sent by "Me" (current viewer)
                      // If Super Admin: 'agent' is Me, 'customer' is Other side
                      // If Subscriber/Agent: for SaaS ticket, 'customer' is Me, 'agent' is Other side
                      //                     for Client ticket, 'agent' is Me, 'customer' is Other side
                      const isMe = isSuperAdmin
                        ? msg.sender === 'agent'
                        : (activeTicket.raisedToSaaS ? msg.sender === 'customer' : msg.sender === 'agent');

                      let avatarBg = 'bg-[#0078d4]';
                      let avatarText = 'CL';
                      let bubbleBg = 'bg-white text-[#323130] border border-[#edebe9] shadow-sm';
                      let badgeText = '';

                      if (activeTicket.raisedToSaaS) {
                        if (msg.sender === 'agent') {
                          // SaaS Support / Super Admin Response
                          avatarBg = 'bg-slate-900';
                          avatarText = 'SA';
                          bubbleBg = 'bg-slate-900 text-white shadow-md border border-slate-800';
                          badgeText = 'SaaS Platform Support';
                        } else {
                          // Subscriber / Company Admin Response
                          avatarBg = 'bg-purple-700';
                          avatarText = 'SU';
                          bubbleBg = 'bg-purple-700 text-white shadow-md border border-purple-800';
                          badgeText = 'Subscriber';
                        }
                      } else {
                        // Standard Client Support Ticket
                        if (msg.sender === 'agent') {
                          avatarBg = 'bg-[#252525]';
                          avatarText = 'TR';
                          bubbleBg = 'bg-[#252525] text-white shadow-sm';
                          badgeText = 'CRM Agent';
                        } else {
                          avatarBg = 'bg-[#0078d4]';
                          avatarText = 'CL';
                          bubbleBg = 'bg-white text-[#323130] border border-[#edebe9] shadow-sm';
                          badgeText = 'Client';
                        }
                      }

                      return (
                        <div key={msg.id} className={`flex gap-3 max-w-lg ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden shadow-xs ${avatarBg}`}>
                            {avatarText}
                          </div>

                          <div className="space-y-1">
                            <div className={`flex items-baseline gap-2 ${isMe ? 'justify-end' : ''}`}>
                              <span className="text-xs font-bold text-[#323130]">{msg.senderName}</span>
                              {badgeText && (
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs ${
                                  msg.sender === 'agent' 
                                    ? (activeTicket.raisedToSaaS ? 'bg-slate-200 text-slate-800' : 'bg-gray-200 text-gray-800')
                                    : (activeTicket.raisedToSaaS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800')
                                }`}>
                                  {badgeText}
                                </span>
                              )}
                              <span className="text-[9px] text-[#605e5c] font-semibold">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className={`p-3 rounded-sm text-xs leading-relaxed ${bubbleBg}`}>
                              <p className="whitespace-pre-wrap">{msg.message}</p>

                              {msg.attachmentName && (
                                <div className={`mt-2 p-1.5 rounded-sm flex items-center gap-1.5 text-[10px] font-semibold border ${
                                  msg.sender === 'agent' || isMe
                                    ? 'bg-white/10 text-white border-white/10'
                                    : 'bg-[#f3f2f1] text-[#323130] border-[#edebe9]'
                                }`}>
                                  <Lucide.FileText size={12} />
                                  <span className="truncate max-w-xs">{msg.attachmentName}</span>
                                  <span className="opacity-65">({msg.attachmentSize})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Reply Area with Quick Templates */}
              {activeTicket && (
                <div className="border-t border-[#edebe9] bg-white p-4 space-y-3 shrink-0">
                  {/* Quick Template drop down */}
                  {!activeTicket.raisedToSaaS && (
                    <div className="flex items-center gap-2">
                      <Lucide.Sliders size={13} className="text-[#0078d4]" />
                      <span className="text-[10px] font-extrabold text-[#605e5c] uppercase tracking-wider">Quick Response Templates:</span>
                      <select
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        className="bg-[#f3f2f1] hover:bg-[#edebe9] text-[11px] text-[#323130] border border-[#edebe9] rounded-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0078d4] font-semibold cursor-pointer max-w-sm truncate"
                      >
                        <option value="">-- Click to insert Template --</option>
                        {QUICK_TEMPLATES.map((tpl, idx) => (
                          <option key={idx} value={tpl}>Template {idx + 1}: {tpl.slice(0, 40)}...</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Form input */}
                  <form onSubmit={handleSendAgentReply} className="flex gap-2">
                    <textarea
                      value={agentReply}
                      onChange={(e) => setAgentReply(e.target.value)}
                      placeholder={activeTicket.raisedToSaaS ? "Reply to the SaaS engineering support team..." : "Write your diagnostic reply or click template above..."}
                      rows={2}
                      className="flex-1 bg-[#f3f2f1] border border-[#edebe9] rounded-sm p-2 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130] font-sans"
                    ></textarea>
                    <div className="flex flex-col gap-2 shrink-0 justify-end">
                      <button
                        type="submit"
                        className={`font-bold rounded-sm px-4 py-2 text-xs cursor-pointer transition-colors ${activeTicket.raisedToSaaS ? 'bg-purple-700 hover:bg-purple-800 text-white' : 'bg-[#0078d4] hover:bg-[#106ebe] text-white'}`}
                      >
                        Send Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right side: Detailed ticket control panels (Assign, Priority, Client Profile, Logs) */}
            {activeTicket && (
              <div className="w-full md:w-80 p-5 bg-white flex flex-col justify-between overflow-y-auto shrink-0 border-l border-[#edebe9]">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest block">Triage Desk</span>
                    <h4 className="font-bold text-[#323130] text-sm mt-0.5">Control Panel Details</h4>
                  </div>

                  {/* Quick Action buttons (Resolve/Close) */}
                  {!activeTicket.raisedToSaaS ? (
                    <div className="flex gap-2">
                      {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' && (
                        <button
                          onClick={() => onUpdateStatus(activeTicket.id, 'resolved')}
                          className="flex-1 bg-[#107c10] hover:bg-[#0b5a0b] text-white font-bold py-2 text-xs rounded-sm shadow-sm transition-colors cursor-pointer text-center"
                        >
                          ✔ Mark Resolved
                        </button>
                      )}
                      {activeTicket.status !== 'closed' && (
                        <button
                          onClick={() => onUpdateStatus(activeTicket.id, 'closed')}
                          className="flex-1 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#605e5c] font-bold py-2 text-xs rounded-sm border border-[#edebe9] transition-colors cursor-pointer text-center"
                        >
                          🔒 Close Ticket
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-purple-50 border border-purple-100 rounded-sm p-3 text-[11px] text-purple-900 leading-relaxed">
                      <p className="font-bold flex items-center gap-1"><Lucide.LifeBuoy size={12} /> SaaS Platform Escalation</p>
                      <p className="mt-1 text-purple-700">This ticket is routed directly to the Super Admin engineering squad for the Trueline SaaS platform. Local agent reassignments are disabled.</p>
                    </div>
                  )}

                  {/* Triage Settings Panel */}
                  {!activeTicket.raisedToSaaS ? (
                    <div className="bg-[#f8f8f8] border border-[#edebe9] rounded-sm p-3.5 space-y-3.5 text-xs">
                      {/* Assign Agent */}
                      <div>
                        <label className="block text-[9px] font-bold text-[#605e5c] uppercase mb-1">Assigned Support Staff</label>
                        <select
                          value={activeTicket.assignedAgentId || ''}
                          onChange={(e) => onAssignAgent(activeTicket.id, e.target.value)}
                          className="w-full bg-white border border-[#edebe9] rounded-sm px-2 py-1 font-semibold text-[#323130] focus:outline-none"
                        >
                          <option value="">-- Select Agent --</option>
                          {MOCK_AGENTS.map(agt => (
                            <option key={agt.id} value={agt.id}>{agt.name} ({agt.role.split(' ')[0]})</option>
                          ))}
                        </select>
                      </div>

                      {/* Change Priority */}
                      <div>
                        <label className="block text-[9px] font-bold text-[#605e5c] uppercase mb-1">Severity / Priority</label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['low', 'medium', 'high', 'critical'] as TicketPriority[]).map((p) => (
                            <button
                              key={p}
                              onClick={() => onUpdatePriority(activeTicket.id, p)}
                              className={`py-1 text-[9px] uppercase font-bold border rounded-sm transition-colors cursor-pointer ${
                                activeTicket.priority === p
                                  ? 'bg-[#0078d4] text-white border-[#0078d4]'
                                  : 'bg-white text-[#605e5c] border-[#edebe9] hover:bg-[#f3f2f1]'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Change Status manually */}
                      <div>
                        <label className="block text-[9px] font-bold text-[#605e5c] uppercase mb-1">Ticket Progress Status</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['open', 'in_progress', 'pending', 'resolved'] as TicketStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => onUpdateStatus(activeTicket.id, s)}
                              className={`py-1 px-1.5 text-[9px] uppercase font-bold border rounded-sm truncate transition-colors cursor-pointer ${
                                activeTicket.status === s
                                  ? 'bg-[#d13438] text-white border-[#d13438]'
                                  : 'bg-white text-[#605e5c] border-[#edebe9] hover:bg-[#f3f2f1]'
                              }`}
                            >
                              {s === 'in_progress' ? 'working' : s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#f8f8f8] border border-[#edebe9] rounded-sm p-3.5 space-y-3.5 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-[#605e5c] uppercase mb-1">Ticket Severity</label>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-sm border inline-block uppercase ${getPriorityColor(activeTicket.priority)}`}>
                          {activeTicket.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#605e5c] uppercase mb-1">Escalated Status</label>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-sm border inline-block uppercase ${getStatusColor(activeTicket.status)}`}>
                          {activeTicket.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Client CRM Profile Card */}
                  {!activeTicket.raisedToSaaS ? (
                    <div className="bg-white border border-[#edebe9] rounded-sm p-3.5 shadow-sm text-xs space-y-2">
                      <span className="text-[9px] font-bold text-[#605e5c] uppercase block">Client CRM Record</span>
                      
                      {activeClientCRM ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-sm bg-[#f3f2f1] text-[#0078d4] font-bold flex items-center justify-center text-[10px] border border-[#edebe9]">
                              {activeClientCRM.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#323130]">{activeClientCRM.company}</span>
                              <span className="text-[10px] text-[#605e5c] block -mt-0.5">{activeClientCRM.name}</span>
                            </div>
                          </div>
                          <div className="border-t border-[#edebe9] pt-1.5 space-y-1 text-[10px] text-[#605e5c]">
                            <p>● Direct Phone: <strong className="text-[#323130]">{activeClientCRM.phone}</strong></p>
                            <p>● Pipeline status: <span className="bg-[#fffdf0] text-[#d83b01] px-1 rounded-sm font-bold border border-[#d83b01]/10">{activeClientCRM.status}</span></p>
                            <p>● Annualized Contract: <strong className="text-[#323130]">{activeClientCRM.value}</strong></p>
                          </div>
                          <button className="w-full text-center py-1 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#0078d4] text-[10px] font-extrabold rounded-sm mt-1.5 cursor-not-allowed border border-[#edebe9]">
                            🔗 Open Customer Ledger File
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[10px] text-[#605e5c]">
                          <p>● Customer: <strong className="text-[#323130]">{activeTicket.customerName}</strong></p>
                          <p>● Contact: <strong className="text-[#323130]">{activeTicket.customerPhone || 'N/A'}</strong></p>
                          <p>● Mailbox: <span className="underline">{activeTicket.customerEmail}</span></p>
                          <span className="text-[9px] text-[#d83b01] italic block mt-1 font-medium">Manual contact (not currently pre-mapped in lead contacts list).</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-purple-50/50 border border-purple-100 rounded-sm p-3.5 shadow-sm text-xs space-y-2">
                      <span className="text-[9px] font-bold text-purple-800 uppercase block">Subscriber Corporate Details</span>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-purple-700 text-white font-bold flex items-center justify-center text-[10px] border border-purple-800">
                            {tenant?.companyName?.slice(0, 2).toUpperCase() || 'TR'}
                          </div>
                          <div>
                            <span className="font-bold text-purple-900">{tenant?.companyName || 'Subscriber Company'}</span>
                            <span className="text-[10px] text-purple-700 block -mt-0.5">{tenant?.ownerName || 'Company Admin'}</span>
                          </div>
                        </div>
                        <div className="border-t border-purple-200/50 pt-1.5 space-y-1 text-[10px] text-purple-700">
                          <p>● Cloud Tenant ID: <strong className="text-purple-900 font-mono">{tenant?.id || 'default'}</strong></p>
                          <p>● Platform License: <span className="bg-purple-100 text-purple-800 px-1 rounded-sm font-bold border border-purple-200 uppercase">{tenant?.plan || 'Standard'} License</span></p>
                          <p>● Admin Contact: <strong className="text-purple-900">{tenant?.ownerEmail || 'admin@tenant.com'}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ISO/Regulatory footer */}
                <div className="pt-4 text-[9px] text-gray-400 leading-tight text-center">
                  Trueline SLA parameters mandate ticket closure within 24 hours of Critical triggers.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
