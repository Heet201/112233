import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Ticket, TicketMessage, CategoryDetail, Tenant } from '../types';
import { MOCK_AGENTS } from '../data';

interface CustomerPortalProps {
  tickets: Ticket[];
  categories: CategoryDetail[];
  onCreateTicket: (ticket: Ticket) => void;
  onAddMessage: (ticketId: string, message: TicketMessage) => void;
  onRateTicket: (ticketId: string, rating: number, feedback: string) => void;
  onReopenTicket?: (ticketId: string) => void;
  activeTenant: Tenant;
  standalone?: boolean;
  onBackToCRM?: () => void;
}

export default function CustomerPortal({
  tickets,
  categories,
  onCreateTicket,
  onAddMessage,
  onRateTicket,
  onReopenTicket,
  activeTenant,
  standalone = false,
  onBackToCRM
}: CustomerPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'help' | 'my_tickets'>(() => {
    return (localStorage.getItem('trueline_client_active_subtab') as 'help' | 'my_tickets') || 'help';
  });
  const [activeTicketId, setActiveTicketId] = useState<string | null>(() => {
    return localStorage.getItem('trueline_client_active_ticket_id') || null;
  });

  // Search and selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Ticket creation fields (Now fully dynamic for public support submit)
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Client Details Input (Stored in state/localStorage to persist who they are)
  const [clientName, setClientName] = useState(() => {
    return localStorage.getItem('trueline_public_client_name') || '';
  });
  const [clientEmail, setClientEmail] = useState(() => {
    return localStorage.getItem('trueline_public_client_email') || '';
  });
  const [clientPhone, setClientPhone] = useState(() => {
    return localStorage.getItem('trueline_public_client_phone') || '';
  });

  // Chat/Attachment states
  const [chatMessage, setChatMessage] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ratings
  const [tempRating, setTempRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Auto Scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve Theme Configuration dynamically
  const getThemeStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          primaryHex: '#107c10',
          bg: 'bg-[#107c10]',
          hoverBg: 'hover:bg-[#0f700f]',
          text: 'text-[#107c10]',
          border: 'border-[#107c10]',
          borderLight: 'border-[#107c10]/20',
          ring: 'focus:ring-[#107c10] focus:border-[#107c10]',
          lightBg: 'bg-[#f1faf1]',
          lightText: 'text-[#107c10]',
          gradient: 'from-[#107c10] to-emerald-700'
        };
      case 'slate':
        return {
          primaryHex: '#323130',
          bg: 'bg-[#323130]',
          hoverBg: 'hover:bg-[#201f1e]',
          text: 'text-[#323130]',
          border: 'border-[#323130]',
          borderLight: 'border-[#323130]/20',
          ring: 'focus:ring-[#323130] focus:border-[#323130]',
          lightBg: 'bg-[#f3f2f1]',
          lightText: 'text-[#323130]',
          gradient: 'from-[#323130] to-gray-700'
        };
      case 'ruby':
        return {
          primaryHex: '#d13438',
          bg: 'bg-[#d13438]',
          hoverBg: 'hover:bg-[#b83235]',
          text: 'text-[#d13438]',
          border: 'border-[#d13438]',
          borderLight: 'border-[#d13438]/20',
          ring: 'focus:ring-[#d13438] focus:border-[#d13438]',
          lightBg: 'bg-[#fff1f1]',
          lightText: 'text-[#d13438]',
          gradient: 'from-[#d13438] to-rose-700'
        };
      case 'orange':
        return {
          primaryHex: '#d83b01',
          bg: 'bg-[#d83b01]',
          hoverBg: 'hover:bg-[#c83701]',
          text: 'text-[#d83b01]',
          border: 'border-[#d83b01]',
          borderLight: 'border-[#d83b01]/20',
          ring: 'focus:ring-[#d83b01] focus:border-[#d83b01]',
          lightBg: 'bg-[#fff4f0]',
          lightText: 'text-[#d83b01]',
          gradient: 'from-[#d83b01] to-orange-700'
        };
      case 'blue':
      default:
        return {
          primaryHex: '#0078d4',
          bg: 'bg-[#0078d4]',
          hoverBg: 'hover:bg-[#106ebe]',
          text: 'text-[#0078d4]',
          border: 'border-[#0078d4]',
          borderLight: 'border-[#0078d4]/20',
          ring: 'focus:ring-[#0078d4] focus:border-[#0078d4]',
          lightBg: 'bg-[#f3f9fd]',
          lightText: 'text-[#0078d4]',
          gradient: 'from-[#0078d4] to-blue-600'
        };
    }
  };

  const theme = getThemeStyles(activeTenant.themeColor);

  // Filter Categories matching Search
  const filteredCategories = categories.filter((category) => {
    const titleMatch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
    const subMatch = category.subCategories.some((sub) =>
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return titleMatch || subMatch;
  });

  const getIcon = (name: string) => {
    switch (name) {
      case 'Database':
        return <Lucide.Database size={16} />;
      case 'Code':
        return <Lucide.Code size={16} />;
      case 'PhoneCall':
        return <Lucide.PhoneCall size={16} />;
      case 'Settings':
        return <Lucide.Settings size={16} />;
      case 'MessageSquare':
        return <Lucide.MessageSquare size={16} />;
      default:
        return <Lucide.HelpCircle size={16} />;
    }
  };

  const selectCategoryForTicket = (category: CategoryDetail, subCategory: string = '') => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory || category.subCategories[0] || 'General Inquiry');
  };

  // Drag and drop attachment helper
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !ticketTitle || !ticketDesc) return;

    // Persist who submitted the ticket to localStorage
    const finalName = clientName.trim() || 'Anonymous Client';
    const finalEmail = clientEmail.trim() || 'anonymous@guest.com';
    const finalPhone = clientPhone.trim() || '+91 99999 99999';

    localStorage.setItem('trueline_public_client_name', finalName);
    localStorage.setItem('trueline_public_client_email', finalEmail);
    localStorage.setItem('trueline_public_client_phone', finalPhone);

    // Generate beautiful ticket prefix based on tenant ID
    const prefix = activeTenant.id.toUpperCase().slice(0, 4);
    const tenantSpecificTickets = tickets.filter(t => t.tenantId === activeTenant.id);
    const nextNum = tenantSpecificTickets.length + 1001;
    const newId = `${prefix}-${nextNum}`;

    const systemMsg: TicketMessage = {
      id: `msg-${Date.now()}-sys`,
      sender: 'system',
      senderName: 'SaaS Gateway',
      message: `Ticket successfully received and logged on the ${activeTenant.companyName} system.`,
      createdAt: new Date().toISOString()
    };

    const initialMsgs: TicketMessage[] = [
      {
        id: `msg-${Date.now()}-user`,
        sender: 'customer',
        senderName: finalName,
        message: ticketDesc,
        createdAt: new Date().toISOString(),
        ...(attachment ? { attachmentName: attachment.name, attachmentSize: attachment.size } : {})
      },
      systemMsg
    ];

    const newTicket: Ticket = {
      id: newId,
      tenantId: activeTenant.id, // Set the current tenant context!
      title: ticketTitle,
      description: ticketDesc,
      category: selectedCategory.id,
      subCategory: selectedSubCategory,
      status: 'open',
      priority: ticketPriority,
      customerName: finalName,
      customerEmail: finalEmail,
      customerPhone: finalPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: initialMsgs
    };

    onCreateTicket(newTicket);

    // Reset form
    setSelectedCategory(null);
    setSelectedSubCategory('');
    setTicketTitle('');
    setTicketDesc('');
    setAttachment(null);

    // Switch to tickets list & focus on this ticket
    setActiveSubTab('my_tickets');
    setActiveTicketId(newId);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicketId) return;

    const finalName = clientName.trim() || 'Client User';

    const reply: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName: finalName,
      message: chatMessage.trim(),
      createdAt: new Date().toISOString()
    };

    onAddMessage(activeTicketId, reply);
    setChatMessage('');

    // Trigger an auto bot reply if the ticket belongs to Trueline Auto-Bot routing
    const currentTkt = tickets.find(t => t.id === activeTicketId);
    if (currentTkt && (!currentTkt.assignedAgentId || currentTkt.assignedAgentId === 'agt-104')) {
      setTimeout(() => {
        const botReply: TicketMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          senderName: `${activeTenant.companyName} Auto-Bot`,
          message: `Hello! We have received your follow-up message. Our technical desk has flagged this update in your ticket record. We will respond with a solution shortly.`,
          createdAt: new Date().toISOString()
        };
        onAddMessage(activeTicketId, botReply);
      }, 1200);
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages?.length]);

  useEffect(() => {
    localStorage.setItem('trueline_client_active_subtab', activeSubTab);
  }, [activeSubTab]);

  useEffect(() => {
    if (activeTicketId) {
      localStorage.setItem('trueline_client_active_ticket_id', activeTicketId);
    } else {
      localStorage.removeItem('trueline_client_active_ticket_id');
    }
  }, [activeTicketId]);

  // Status Badge styling - Geometric Balance theme
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fff1f1] text-[#d13438] rounded-sm border border-[#d13438]/10">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fffdf0] text-[#ffb900] rounded-sm border border-[#ffb900]/10 font-sans">In Progress</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f1faf1] text-[#107c10] rounded-sm border border-[#107c10]/10">Pending</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f1faf1] text-[#107c10] rounded-sm border border-[#107c10]/20">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f3f2f1] text-[#605e5c] rounded-sm border border-[#edebe9]">Closed</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="text-[10px] uppercase font-bold text-[#605e5c]">● Low</span>;
      case 'medium':
        return <span className="text-[10px] uppercase font-bold text-indigo-600">● Medium</span>;
      case 'high':
        return <span className="text-[10px] uppercase font-bold text-[#d83b01]">● High</span>;
      case 'critical':
        return <span className="text-[10px] uppercase font-bold text-[#d13438] animate-pulse">● Critical</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f2f1] font-sans text-[#323130]">
      
      {/* Dynamic Header incorporating company branding */}
      <div className="bg-white border-b border-[#edebe9] px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className={`w-9 h-9 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs ${theme.bg}`}>
            {activeTenant.logoText || 'TL'}
          </span>
          <div>
            <h1 className="text-base font-bold text-[#323130] flex items-center gap-1.5 leading-tight">
              {activeTenant.companyName} Customer Support
              {standalone && (
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  Public Portal
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#605e5c] mt-0.5">{activeTenant.headline}</p>
          </div>
        </div>
        
        {/* Support Tab Switcher */}
        <div className="flex gap-6 h-full items-center">
          <button
            onClick={() => {
              setActiveSubTab('help');
              setSelectedCategory(null);
            }}
            className={`pb-1 text-xs font-bold uppercase tracking-wider relative transition-colors cursor-pointer ${
              activeSubTab === 'help' && !selectedCategory
                ? theme.text + ' border-b-2 ' + theme.border
                : 'text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => {
              setActiveSubTab('my_tickets');
              setSelectedCategory(null);
            }}
            className={`pb-1 text-xs font-bold uppercase tracking-wider relative transition-colors cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'my_tickets'
                ? theme.text + ' border-b-2 ' + theme.border
                : 'text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            My Tickets ({tickets.length})
          </button>

          {/* Developers Back Button */}
          {onBackToCRM && (
            <button
              onClick={onBackToCRM}
              className="ml-2 flex items-center gap-1 bg-[#323130] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-sm hover:bg-[#201f1e] cursor-pointer transition-all uppercase tracking-wider"
              title="Return back to the Master CRM panel"
            >
              <Lucide.LayoutDashboard size={11} />
              <span>Dashboard</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'help' && !selectedCategory && (
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            
            {/* Welcome banner description */}
            <div className="bg-white border border-[#edebe9] p-5 rounded-sm shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Welcome Guide</span>
              <p className="text-xs text-slate-600 leading-normal">
                {activeTenant.subtitle} You may select a troubleshooting category from our standard list below, or view ongoing tickets using the tabs above.
              </p>
            </div>

            {/* Real-time sync notice */}
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-sm shadow-xs flex items-start gap-2.5">
              <Lucide.RefreshCw className="text-emerald-600 shrink-0 mt-0.5 animate-spin" size={15} style={{ animationDuration: '3s' }} />
              <div className="text-xs">
                <span className="font-bold block text-emerald-900">🔄 Active Sandbox Real-time Sync</span>
                Any ticket raised from this page will show up <strong className="font-bold text-emerald-950">instantly</strong> in your CRM Admin Panel (even across multiple browser tabs/windows!). Feel free to copy the direct link and test it.
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for issues, documentation keywords, setup guides..."
                className={`w-full bg-white border border-[#edebe9] rounded-sm px-10 py-3 text-xs focus:outline-none focus:ring-1 ${theme.ring} shadow-sm text-[#323130]`}
              />
              <Lucide.Search className="absolute left-3.5 top-3.5 text-[#605e5c]" size={15} />
            </div>

            {/* Select Issue Category Grid */}
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3.5">Select Help Category</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-sm border border-[#edebe9] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[#323130] font-bold border-b border-[#f3f2f1] pb-2">
                          <span className={theme.text}>{getIcon(category.iconName)}</span>
                          <span className="text-xs font-bold">{category.title}</span>
                        </div>

                        {/* Top 3 issues */}
                        <div className="space-y-1.5">
                          {category.subCategories.slice(0, 3).map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => selectCategoryForTicket(category, sub)}
                              className="w-full text-left text-xs text-[#605e5c] hover:text-slate-900 py-1.5 flex items-center justify-between group transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                            >
                              <span className="truncate pr-2 font-medium">{sub}</span>
                              <Lucide.ChevronRight size={11} className={`text-gray-300 group-hover:${theme.text} shrink-0`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* View All Bottom Bar */}
                      <button
                        onClick={() => selectCategoryForTicket(category)}
                        className={`bg-[#f8f8f8] hover:bg-gray-100 ${theme.text} text-[10px] font-bold uppercase tracking-wider text-left px-4 py-2 border-t border-[#edebe9] flex items-center justify-between cursor-pointer transition-colors`}
                      >
                        <span>View All Under {category.title}</span>
                        <Lucide.ChevronRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Note Footer */}
            <div className={`${theme.bg} text-white rounded-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm`}>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-xs tracking-wide uppercase">Issue not listed above?</h3>
                <p className="text-[11px] text-white/80">Raise a direct customized Priority ticket to our senior triage desk.</p>
              </div>
              <button
                onClick={() => selectCategoryForTicket(categories[categories.length - 1])}
                className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-sm shadow-sm hover:bg-gray-50 cursor-pointer transition-colors shrink-0"
              >
                File Direct Support Ticket
              </button>
            </div>
          </div>
        )}

        {/* Create Ticket Form */}
        {activeSubTab === 'help' && selectedCategory && (
          <div className="max-w-2xl mx-auto p-6">
            
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-xs font-bold text-[#605e5c] hover:text-slate-900 mb-4 cursor-pointer"
            >
              <Lucide.ArrowLeft size={13} />
              <span>Back to Categories</span>
            </button>

            <div className="bg-white rounded-sm border border-[#edebe9] shadow-md overflow-hidden">
              {/* Category Header Banner */}
              <div className={`${theme.bg} text-white p-5 flex items-center gap-3`}>
                <div className="bg-white/15 p-2.5 rounded-sm">
                  {getIcon(selectedCategory.iconName)}
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-white/70">SaaS Ticket Dispatch Gateway</span>
                  <h2 className="text-sm font-black uppercase tracking-wide">{selectedCategory.title}</h2>
                </div>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                
                {/* 1. Public user Identity Fields */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    🔒 Client Contact Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rajesh Mehta"
                        className={`w-full bg-white border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:ring-1 ${theme.ring} focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Your Email Address *</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="e.g. rajesh@apexcorp.in"
                        className={`w-full bg-white border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:ring-1 ${theme.ring} focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Your Contact Phone *</label>
                      <input
                        type="text"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className={`w-full bg-white border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:ring-1 ${theme.ring} focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Category */}
                <div>
                  <label className="block text-[10px] font-bold text-[#323130] uppercase mb-1">
                    Select Specific Concern Area
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className={`w-full bg-gray-50 border border-[#edebe9] rounded-sm px-3 py-2 text-xs focus:ring-1 ${theme.ring} focus:outline-none text-[#323130] font-semibold`}
                  >
                    {selectedCategory.subCategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                    <option value="General inquiry">General Inquiry / Other</option>
                  </select>
                </div>

                {/* 3. Title & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <label className="block text-[10px] font-bold text-[#323130] uppercase mb-1">
                      Issue Subject / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      placeholder="e.g., CSV lead upload error on attendance panel"
                      className={`w-full bg-gray-50 border border-[#edebe9] rounded-sm px-3 py-2 text-xs focus:ring-1 ${theme.ring} focus:outline-none text-[#323130]`}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-[#323130] uppercase mb-1">
                      Priority Level
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className={`w-full bg-gray-50 border border-[#edebe9] rounded-sm px-3 py-2 text-xs focus:ring-1 ${theme.ring} focus:outline-none text-[#323130] font-bold`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">🔥 Critical Incident</option>
                    </select>
                  </div>
                </div>

                {/* 4. Description */}
                <div>
                  <label className="block text-[10px] font-bold text-[#323130] uppercase mb-1">
                    Explain what is failing *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Provide detailed description of error codes, server outputs, or configuration changes..."
                    className={`w-full bg-gray-50 border border-[#edebe9] rounded-sm p-3 text-xs focus:ring-1 ${theme.ring} focus:outline-none text-[#323130] font-sans`}
                  ></textarea>
                </div>

                {/* File Upload Attachment component */}
                {activeTenant.enableAttachments !== false && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#323130] uppercase mb-1">
                      Log file, screenshots or diagnostics (optional)
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-sm p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-[#0078d4] bg-[#f1faf1]'
                          : `border-[#edebe9] hover:border-gray-500 bg-gray-50 hover:bg-gray-100`
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Lucide.UploadCloud size={24} className="text-gray-400" />
                      <span className="text-xs font-bold text-slate-800 mt-1">
                        Drag & drop files here to upload
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        Max file limit 10MB
                      </span>

                      {attachment && (
                        <div className="mt-3 bg-white border border-[#edebe9] rounded-sm px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs text-[#323130]">
                          <Lucide.FileText size={14} className={theme.text} />
                          <span className="font-semibold truncate max-w-xs">{attachment.name}</span>
                          <span className="text-[10px] text-[#605e5c]">({attachment.size})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachment(null);
                            }}
                            className="text-[#605e5c] hover:text-[#d13438] p-0.5 rounded-sm ml-1 cursor-pointer"
                          >
                            <Lucide.X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 text-xs font-bold text-[#605e5c] hover:text-[#323130] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${theme.bg} ${theme.hoverBg} text-white font-bold text-xs px-6 py-2.5 rounded-sm shadow-sm cursor-pointer transition-colors`}
                  >
                    Submit Support Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Tickets list view */}
        {activeSubTab === 'my_tickets' && !activeTicketId && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-sm border border-[#edebe9] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#edebe9] flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-[#323130] text-sm">Active & Resolved Tickets</h3>
                <span className="text-xs text-[#605e5c] font-medium">
                  Trace state of queries for: <strong className={theme.text}>{clientEmail || 'all email entries'}</strong>
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Lucide.Ticket size={36} className="text-gray-300" />
                  <p className="text-sm font-bold text-[#323130]">No support tickets found</p>
                  <p className="text-xs text-[#605e5c]">You do not have any active or previous support tickets submitted under this company.</p>
                  <button
                    onClick={() => setActiveSubTab('help')}
                    className={`${theme.bg} text-white text-xs font-bold px-4 py-2 rounded-sm cursor-pointer ${theme.hoverBg}`}
                  >
                    Raise Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8f8f8] text-[10px] font-bold text-[#605e5c] uppercase tracking-wider border-b border-[#edebe9]">
                        <th className="p-4 w-28 pl-4">Ticket ID</th>
                        <th className="p-4">Issue Details</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-4 text-right">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3f2f1]">
                      {tickets.map((tkt) => (
                        <tr
                          key={tkt.id}
                          onClick={() => setActiveTicketId(tkt.id)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className={`p-4 font-mono font-bold ${theme.text} pl-4`}>{tkt.id}</td>
                          <td className="p-4">
                            <div>
                              <p className={`font-semibold text-[#323130] group-hover:${theme.text} transition-colors text-xs truncate max-w-md`}>
                                {tkt.title}
                              </p>
                              <p className="text-[#605e5c] text-[10px] truncate max-w-sm mt-0.5">{tkt.description}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block text-slate-800">{tkt.customerName}</span>
                            <span className="text-[10px] text-gray-400 block">{tkt.customerEmail}</span>
                          </td>
                          <td className="p-4">{getStatusBadge(tkt.status)}</td>
                          <td className="p-4 pr-4 text-right text-[#605e5c] font-semibold whitespace-nowrap">
                            {new Date(tkt.updatedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ticket Chat & Details Conversation View */}
        {activeSubTab === 'my_tickets' && activeTicketId && activeTicket && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#f3f2f1]">
            {/* Left side: Chat History Panel */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#edebe9] bg-white">
              {/* Chat Header with Status/Back */}
              <div className="p-4 border-b border-[#edebe9] bg-white flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    setActiveTicketId(null);
                    setTempRating(0);
                    setFeedbackText('');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#605e5c] hover:text-slate-900 cursor-pointer"
                >
                  <Lucide.ChevronLeft size={16} />
                  <span>Back to Tickets</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${theme.text} text-xs`}>{activeTicket.id}</span>
                  {getStatusBadge(activeTicket.status)}
                </div>
              </div>

              {/* Chat Body Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f3f2f1]">
                {/* Initial Ticket Desc Card */}
                <div className="bg-white border border-[#edebe9] rounded-sm p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#605e5c] uppercase">Initial Query</span>
                    <span className="text-[9px] text-[#605e5c] font-semibold">
                      {new Date(activeTicket.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#323130] text-sm">{activeTicket.title}</h3>
                  <p className="text-xs text-[#605e5c] leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>
                </div>

                {/* Conversation messages thread */}
                {activeTicket.messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="bg-white border border-[#edebe9] text-[#605e5c] text-[10px] font-bold px-3 py-1 rounded-sm text-center shadow-xs">
                          ⚙️ {msg.message}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-lg ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${
                        isMe ? theme.bg : 'bg-[#323130]'
                      }`}>
                        {isMe ? msg.senderName.slice(0, 2).toUpperCase() : activeTenant.logoText}
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-baseline gap-2 ${isMe ? 'justify-end' : ''}`}>
                          <span className="text-[11px] font-bold text-slate-800">{msg.senderName}</span>
                          <span className="text-[9px] text-gray-400 font-semibold">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Speech Bubble */}
                        <div className={`p-3 rounded-sm text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? `${theme.bg} text-white`
                            : 'bg-white text-slate-800 border border-slate-200'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>

                          {/* Attachment Link if any */}
                          {msg.attachmentName && (
                            <div className={`mt-2 p-1.5 rounded-sm flex items-center gap-1.5 text-[9px] font-semibold border ${
                              isMe
                                ? 'bg-black/10 text-white border-white/20'
                                : 'bg-[#f3f2f1] text-[#323130] border-[#edebe9]'
                            }`}>
                              <Lucide.FileText size={12} />
                              <span className="truncate max-w-xs">{msg.attachmentName}</span>
                              <span className="opacity-60">({msg.attachmentSize})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input or rating module if ticket resolved */}
              {activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? (
                <div className="p-4 border-t border-[#edebe9] bg-[#f8f8f8] space-y-3">
                  {activeTicket.rating ? (
                    <div className="bg-white rounded-sm p-4 border border-[#edebe9] text-center space-y-3 shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-[#323130]">You rated this support experience</p>
                        <div className="flex justify-center gap-1 text-[#ffb900] mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Lucide.Star
                              key={i}
                              size={16}
                              fill={i < activeTicket.rating! ? '#ffb900' : 'none'}
                              className="text-[#ffb900]"
                            />
                          ))}
                        </div>
                      </div>
                      {activeTicket.feedback && (
                        <p className="text-xs italic text-[#605e5c] bg-[#f3f2f1] p-2 rounded-sm border border-[#edebe9]">
                          "{activeTicket.feedback}"
                        </p>
                      )}
                      <div className="pt-3 border-t border-[#edebe9]">
                        <p className="text-[10px] text-gray-400 mb-2">Did this issue reoccur? Reopen this log card.</p>
                        <button
                          onClick={() => onReopenTicket?.(activeTicket.id)}
                          className={`w-full bg-white hover:bg-slate-50 ${theme.text} border ${theme.border} font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors`}
                        >
                          Reopen Ticket Log
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-sm p-4 border border-[#edebe9] space-y-3 shadow-sm">
                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-[#323130]">This Ticket has been Resolved! 🎉</p>
                        <p className="text-xs text-[#605e5c]">Please rate support services to close this log card.</p>
                      </div>

                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setTempRating(star)}
                            className="text-[#ffb900] hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Lucide.Star
                              size={24}
                              fill={star <= tempRating ? '#ffb900' : 'none'}
                              className={star <= tempRating ? 'text-[#ffb900]' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>

                      {tempRating > 0 && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Add your comments / suggestions (optional)..."
                            className="w-full bg-[#f3f2f1] border border-[#edebe9] rounded-sm p-2 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130]"
                          />
                          <button
                            onClick={() => onRateTicket(activeTicket.id, tempRating, feedbackText)}
                            className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors`}
                          >
                            Submit Rating & Close Ticket
                          </button>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#edebe9] text-center">
                        <p className="text-[11px] text-[#605e5c] mb-2">Still facing the issue?</p>
                        <button
                          onClick={() => onReopenTicket?.(activeTicket.id)}
                          className="w-full bg-white hover:bg-red-50 text-[#d13438] border border-[#d13438] font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors"
                        >
                          No, Reopen Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="p-3 border-t border-[#edebe9] bg-white flex gap-2 shrink-0">
                  <input
                    type="text"
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={`Type a message to ${activeTenant.companyName} desk...`}
                    className={`flex-1 bg-slate-50 border border-slate-200 rounded-sm px-4 py-2.5 text-xs focus:ring-1 ${theme.ring} focus:outline-none text-[#323130]`}
                  />
                  <button
                    type="submit"
                    className={`${theme.bg} text-white font-bold rounded-sm px-4 py-2 text-xs ${theme.hoverBg} transition-colors shrink-0 cursor-pointer`}
                  >
                    Reply
                  </button>
                </form>
              )}
            </div>

            {/* Right side: Ticket Metadata Panel */}
            <div className="w-full md:w-72 p-5 bg-white border-l border-[#edebe9] flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-[#605e5c] uppercase tracking-widest block">Ticket Info</span>
                  <h4 className="font-bold text-[#323130] text-xs mt-0.5">Triage Meta Logs</h4>
                </div>

                {/* Progress bar based on ticket state */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-400">
                    <span>Progress Tracker</span>
                    <span>
                      {activeTicket.status === 'open' && '15%'}
                      {activeTicket.status === 'in_progress' && '50%'}
                      {activeTicket.status === 'pending' && '75%'}
                      {activeTicket.status === 'resolved' && '100%'}
                      {activeTicket.status === 'closed' && '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeTicket.status === 'resolved' || activeTicket.status === 'closed'
                          ? 'bg-[#107c10] w-full'
                          : activeTicket.status === 'pending'
                          ? theme.bg + ' w-3/4'
                          : activeTicket.status === 'in_progress'
                          ? 'bg-[#ffb900] w-1/2'
                          : 'bg-[#d13438] w-1/6'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Metadata List block */}
                <div className="space-y-2.5 bg-slate-50 border border-slate-200/60 rounded-sm p-3.5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Category</span>
                    <span className="font-semibold text-[#323130]">
                      {categories.find(c => c.id === activeTicket.category)?.title || activeTicket.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Sub-Category</span>
                    <span className="font-semibold text-[#605e5c] leading-tight block mt-0.5">{activeTicket.subCategory}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Priority Level</span>
                    <div className="mt-0.5">{getPriorityBadge(activeTicket.priority)}</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Reported By</span>
                    <span className="font-bold text-[#323130] block">{activeTicket.customerName}</span>
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{activeTicket.customerEmail}</span>
                  </div>
                </div>

                {/* Assigned Support Agent */}
                <div className="bg-white border border-[#edebe9] rounded-sm p-3 shadow-sm text-xs">
                  <span className="text-[9px] font-bold text-[#605e5c] uppercase block mb-1.5">Assigned Expert</span>
                  {activeTicket.assignedAgentId ? (
                    (() => {
                      const agent = MOCK_AGENTS.find(a => a.id === activeTicket.assignedAgentId);
                      if (!agent) return null;
                      return (
                        <div className="flex items-center gap-2">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#edebe9]"
                          />
                          <div>
                            <p className="font-bold text-[#323130] text-[11px]">{agent.name}</p>
                            <p className="text-[9px] text-[#605e5c]">{agent.role}</p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400 py-1">
                      <Lucide.UserMinus size={14} />
                      <span className="font-semibold text-[10px]">Awaiting Engineer Assignment</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical disclaimer */}
              <div className="pt-4 text-[9px] text-gray-400 leading-normal text-center border-t border-gray-100">
                Communications securely routed under ISO 27001 B2B tenant isolation architecture.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
