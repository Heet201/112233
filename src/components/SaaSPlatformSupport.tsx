import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Paperclip,
  ChevronRight,
  ShieldQuestion,
  User,
  ArrowLeft,
  X,
  Search,
  Settings,
  Sliders,
  PhoneCall,
  Code,
  Coins,
  Database,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant, Ticket, TicketMessage, TicketPriority } from '../types';

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
      'Request full system demo & training',
      'Submit new feature request / suggestion',
      'Report general performance bug'
    ]
  }
];

interface SaaSPlatformSupportProps {
  tenant: Tenant;
  tickets: Ticket[];
  onCreateTicket: (newTicket: Ticket) => void;
  onAddMessage: (ticketId: string, message: TicketMessage) => void;
}

export default function SaaSPlatformSupport({
  tenant,
  tickets,
  onCreateTicket,
  onAddMessage
}: SaaSPlatformSupportProps) {
  const [isRaising, setIsRaising] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing & Subscription');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [description, setDescription] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filter tickets raised by this subscriber/tenant to the SaaS platform
  const saasTickets = tickets.filter(t => t.raisedToSaaS && t.tenantId === tenant.id);
  const selectedTicket = saasTickets.find(t => t.id === selectedTicketId);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Settings':
        return <Settings size={18} className="text-purple-600" />;
      case 'Sliders':
        return <Sliders size={18} className="text-purple-600" />;
      case 'PhoneCall':
        return <PhoneCall size={18} className="text-purple-600" />;
      case 'Code':
        return <Code size={18} className="text-purple-600" />;
      case 'Coins':
        return <Coins size={18} className="text-purple-600" />;
      case 'Database':
        return <Database size={18} className="text-purple-600" />;
      default:
        return <HelpCircle size={18} className="text-purple-600" />;
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const ticketId = `SAAS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: ticketId,
      tenantId: tenant.id,
      raisedToSaaS: true, // Tag identifying it as a SaaS ticket (invisible to end-users)
      title: subject,
      description: description,
      category: category,
      subCategory: selectedSubCategory || 'SaaS Platform Support Request',
      status: 'open',
      priority: priority,
      customerName: tenant.ownerName || 'Company Administrator',
      customerEmail: tenant.ownerEmail || 'admin@tenant.com',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'customer', // Acting as client to the SaaS
          senderName: `${tenant.ownerName} (${tenant.companyName})`,
          message: description,
          createdAt: now
        }
      ]
    };

    onCreateTicket(newTicket);
    setSubject('');
    setDescription('');
    setIsRaising(false);
    setSelectedCategory(null);
    setSelectedSubCategory('');
    setFormSuccess('Your support ticket has been raised successfully to the SaaS platform team!');
    setTimeout(() => setFormSuccess(''), 4000);
    setSelectedTicketId(ticketId); // Select the newly raised ticket
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer', // Admin is the customer to the SaaS
      senderName: `${tenant.ownerName} (${tenant.companyName})`,
      message: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    onAddMessage(selectedTicketId, newMessage);
    setReplyText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f3f2f1] font-sans text-[#323130] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#edebe9] px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-sm">
            <LifeBuoy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">SaaS Platform Support</h1>
              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                Direct Helpdesk
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Raise system tickets directly to 365 CRM SaaS Super Administrators for licensing, custom features, or platform bugs.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setIsRaising(true);
            setSelectedTicketId(null);
          }}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3 py-2 rounded-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>Raise Ticket to SaaS</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Pane: Ticket History List */}
        <div className="w-80 border-r border-[#edebe9] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#edebe9] bg-gray-50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              My Support Tickets ({saasTickets.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f3f2f1]">
            {saasTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-400 space-y-2 mt-4">
                <ShieldQuestion size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-semibold">No tickets raised to SaaS yet</p>
                <p className="text-[10px] leading-relaxed">
                  Have an issue with subscription plans, database limits, or feature configuration? Use the button above to request help from the SaaS owners.
                </p>
              </div>
            ) : (
              saasTickets.map((t) => {
                const isActive = t.id === selectedTicketId;
                const lastMsg = t.messages[t.messages.length - 1];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setIsRaising(false);
                    }}
                    className={`w-full text-left p-4 hover:bg-[#faf9f8] transition-colors cursor-pointer ${
                      isActive ? 'bg-[#f3f2f1] border-l-4 border-l-purple-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                        {t.id}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-wide ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                      {t.title}
                    </h4>

                    <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">
                      {t.category}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                      {t.priority === 'critical' || t.priority === 'high' ? (
                        <span className="text-rose-600 font-extrabold uppercase">
                          {t.priority}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {t.priority}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Multi-view Detail Workspace */}
        <div className="flex-1 flex flex-col bg-[#faf9f8] overflow-hidden">
          {formSuccess && (
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {isRaising ? (
            /* RAISE TICKET FLOW: CATEGORY SELECT OR FORM */
            !selectedCategory ? (
              /* STEP 1: SELECT HELP CATEGORY GRID */
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
                <div className="border-b border-[#edebe9] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <LifeBuoy size={16} className="text-purple-700" />
                      Select SaaS Support Category
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      To help us route your request to the right Super Admin engineering squad, please choose a category below.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsRaising(false);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Direct escalation badge */}
                <div className="bg-purple-50 border border-purple-100 text-purple-900 p-4 rounded-sm shadow-xs flex items-start gap-2.5">
                  <span className="text-purple-700 text-sm mt-0.5">👑</span>
                  <div className="text-xs">
                    <span className="font-bold block text-purple-950">👑 Direct B2B SaaS Escalation Gateway</span>
                    Raising a ticket here routes it directly to the 365 CRM SaaS platform owners (Super Administrators). These requests bypass your local tenant database limits and are evaluated under your Premium plan SLAs.
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for issues, documentation keywords, setup guides..."
                    className="w-full bg-white border border-gray-300 rounded-sm px-10 py-3 text-xs focus:outline-none focus:border-purple-700 shadow-sm text-slate-800 font-medium"
                  />
                  <Search className="absolute left-3.5 top-3.5 text-gray-400" size={15} />
                </div>

                {/* Select Issue Category Grid */}
                <div>
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3.5">Select Help Category</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SAAS_CATEGORIES.filter((cat) => {
                      const titleMatch = cat.title.toLowerCase().includes(searchQuery.toLowerCase());
                      const subMatch = cat.subCategories.some((sub) =>
                        sub.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      return titleMatch || subMatch;
                    }).map((category) => {
                      return (
                        <div
                          key={category.id}
                          className="bg-white rounded-sm border border-[#edebe9] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                        >
                          {/* Card Content */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-[#f3f2f1] pb-2">
                              <span>{getIcon(category.iconName)}</span>
                              <span className="text-xs font-bold text-slate-900">{category.title}</span>
                            </div>

                            {/* Top 3 issues */}
                            <div className="space-y-1.5">
                              {category.subCategories.map((sub, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setSelectedSubCategory(sub);
                                    setSubject(sub);
                                    setCategory(category.title);
                                  }}
                                  className="w-full text-left text-xs text-gray-500 hover:text-purple-700 py-1.5 flex items-center justify-between group transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                  <span className="truncate pr-2 font-medium">{sub}</span>
                                  <ChevronRight size={11} className="text-gray-300 group-hover:text-purple-700 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* View All Bottom Bar */}
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setSelectedSubCategory('General Inquiry');
                              setSubject(`Inquiry regarding ${category.title}`);
                              setCategory(category.title);
                            }}
                            className="bg-[#f8f8f8] hover:bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider text-left px-4 py-2 border-t border-[#edebe9] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span>View All Under {category.title}</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct escalation footer */}
                <div className="bg-purple-700 text-white rounded-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-bold text-xs tracking-wide uppercase">Issue not listed above?</h3>
                    <p className="text-[11px] text-purple-100">Raise a direct customized high-priority ticket directly to the Super Admin squad.</p>
                  </div>
                  <button
                    onClick={() => {
                      const generalCategory = SAAS_CATEGORIES[SAAS_CATEGORIES.length - 1];
                      setSelectedCategory(generalCategory);
                      setSelectedSubCategory('Direct Custom Support');
                      setSubject('');
                      setCategory(generalCategory.title);
                    }}
                    className="bg-white text-purple-900 font-bold text-xs px-4 py-2 rounded-sm shadow-sm hover:bg-purple-50 cursor-pointer transition-colors shrink-0"
                  >
                    File Direct Support Ticket
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: SHOW THE COMPREHENSIVE TICKET FORM */
              <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#edebe9] p-6 rounded-sm shadow-xs space-y-5"
                >
                  <div className="border-b border-[#edebe9] pb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubCategory('');
                      }}
                      className="text-purple-700 hover:text-purple-800 text-xs font-bold flex items-center gap-1 mb-2 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Back to Category Selection</span>
                    </button>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Plus size={16} className="text-purple-700" />
                        Create SaaS Support Request
                      </h2>
                      <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-1.5 font-bold">
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-sm">
                          {selectedCategory.title}
                        </span>
                        <ChevronRight size={10} className="text-gray-400" />
                        <span className="text-slate-700">
                          {selectedSubCategory}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Support Subject / Title
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Need to expand maximum CRM contacts limit / Billing receipt error"
                        className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-purple-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Inquiry Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none bg-white"
                        >
                          {SAAS_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.title}>
                              {cat.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Issue Severity
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                          className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none bg-white font-semibold"
                        >
                          <option value="low">Low - Minor question</option>
                          <option value="medium">Medium - Default workflow affected</option>
                          <option value="high">High - High priority business issue</option>
                          <option value="critical">Critical - System down / Billing failure</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Detailed Explanation
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide full details about your request so our Super Admin engineering team can diagnose immediately..."
                        rows={5}
                        className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-purple-600 resize-none font-sans"
                        required
                      />
                    </div>

                    <div className="pt-2.5 flex items-center justify-end gap-3 border-t border-[#edebe9]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedSubCategory('');
                          setIsRaising(false);
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-sm shadow-xs transition-colors cursor-pointer"
                      >
                        Submit Ticket to SaaS
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )
          ) : selectedTicket ? (
            /* TICKET CHAT / DETAIL PANE */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
              {/* Active Ticket Header Info */}
              <div className="p-5 border-b border-[#edebe9] bg-slate-50 shrink-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-purple-700 uppercase tracking-widest bg-purple-100/50 px-2 py-0.5 rounded-sm">
                      {selectedTicket.id}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">•</span>
                    <span className="text-xs text-slate-500 font-bold">{selectedTicket.category}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedTicket.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-extrabold rounded-sm uppercase tracking-wider ${
                    selectedTicket.status === 'open' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    Status: {selectedTicket.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-[10px] font-extrabold rounded-sm uppercase tracking-wider ${
                    selectedTicket.priority === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    Priority: {selectedTicket.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Messages Chat Feed */}
              <div className="flex-1 overflow-y-auto p-5 bg-[#faf9f8] space-y-4">
                {selectedTicket.messages.map((msg) => {
                  const isSaaSReplier = msg.sender === 'agent' || msg.sender === 'system';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-xl ${isSaaSReplier ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                        isSaaSReplier ? 'bg-purple-700 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {isSaaSReplier ? '👑' : tenant.logoText || 'US'}
                      </div>

                      {/* Msg Card */}
                      <div className="space-y-1">
                        <div className={`flex items-baseline gap-2 ${isSaaSReplier ? 'justify-start' : 'justify-end'}`}>
                          <span className="text-[11px] font-bold text-slate-800">
                            {isSaaSReplier ? 'SaaS Super Admin' : msg.senderName}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-sm shadow-xs text-xs font-medium leading-relaxed ${
                          isSaaSReplier 
                            ? 'bg-purple-50 text-purple-950 border border-purple-100 rounded-tl-none' 
                            : 'bg-indigo-600 text-white rounded-tr-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                <form onSubmit={handleSendReply} className="p-4 border-t border-[#edebe9] bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message to SaaS Support team..."
                    className="flex-1 text-xs border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-purple-600 bg-gray-50"
                  />
                  <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white p-2.5 rounded-sm shadow-xs shrink-0 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 border-t border-[#edebe9] text-center text-xs text-gray-500 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>This ticket was resolved/closed. You can raise a new ticket if you need further help.</span>
                </div>
              )}
            </div>
          ) : (
            /* NO SELECTION */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <LifeBuoy size={32} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">SaaS Support Center</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Select an existing support request from the history side-pane, or raise a new ticket to chat with our B2B SaaS platform admin engineers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
