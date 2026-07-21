import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Ticket, TicketCategory, TicketPriority, TicketMessage, CategoryDetail } from '../types';
import { MOCK_AGENTS } from '../data';

interface CustomerPortalProps {
  tickets: Ticket[];
  categories: CategoryDetail[];
  onCreateTicket: (ticket: Ticket) => void;
  onAddMessage: (ticketId: string, message: TicketMessage) => void;
  onRateTicket: (ticketId: string, rating: number, feedback: string) => void;
  onReopenTicket?: (ticketId: string) => void;
}

export default function CustomerPortal({
  tickets,
  categories,
  onCreateTicket,
  onAddMessage,
  onRateTicket,
  onReopenTicket
}: CustomerPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'help' | 'my_tickets'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket Submission Form State
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority] = useState<TicketPriority>('high');
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Active Ticket Conversation
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  
  // Rating form state
  const [tempRating, setTempRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subCategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getIcon = (iconName: string) => {
    const IconComp = (Lucide as any)[iconName];
    return IconComp ? <IconComp size={20} /> : <Lucide.HelpCircle size={20} />;
  };

  // Drag and drop attachment mock
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
        size: `${Math.round(file.size / 1024)} KB`
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`
      });
    }
  };

  const selectCategoryForTicket = (category: CategoryDetail, subCategory = '') => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory || category.subCategories[0]);
    setTicketTitle(subCategory ? `Issues regarding: ${subCategory}` : '');
    setTicketDesc('');
    setAttachment(null);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !ticketTitle || !ticketDesc) return;

    // Generate sequential ID starting with TLS-01
    const tlsIds = tickets
      .map(t => {
        const match = t.id.match(/^TLS-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(val => val > 0);
    const maxIdNum = tlsIds.length > 0 ? Math.max(...tlsIds) : 0;
    const nextIdNum = maxIdNum + 1;
    const newId = `TLS-${nextIdNum.toString().padStart(2, '0')}`;
    const systemMsg: TicketMessage = {
      id: `msg-${Date.now()}-sys`,
      sender: 'system',
      senderName: 'System',
      message: `Ticket successfully filed in ${selectedCategory.title}. Trueline's support engineers will review your request shortly.`,
      createdAt: new Date().toISOString()
    };

    const initialMsgs: TicketMessage[] = [];
    
    // Add user's primary message
    initialMsgs.push({
      id: `msg-${Date.now()}-user`,
      sender: 'customer',
      senderName: 'Rajesh Mehta (Demo)', // Standard logged-in user
      message: ticketDesc,
      createdAt: new Date().toISOString(),
      ...(attachment ? { attachmentName: attachment.name, attachmentSize: attachment.size } : {})
    });
    
    initialMsgs.push(systemMsg);

    const newTicket: Ticket = {
      id: newId,
      title: ticketTitle,
      description: ticketDesc,
      category: selectedCategory.id,
      subCategory: selectedSubCategory,
      status: 'open',
      priority: ticketPriority,
      customerName: 'Rajesh Mehta',
      customerEmail: 'rajesh@apexcorp.in',
      customerPhone: '+91 98765 43210',
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
    // Switch to tickets list & open the ticket
    setActiveSubTab('my_tickets');
    setActiveTicketId(newId);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicketId) return;

    const reply: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName: 'Rajesh Mehta',
      message: chatMessage.trim(),
      createdAt: new Date().toISOString()
    };

    onAddMessage(activeTicketId, reply);
    setChatMessage('');

    // Trigger an auto bot response if the ticket status is open or assigned to auto bot
    const currentTkt = tickets.find(t => t.id === activeTicketId);
    if (currentTkt && (!currentTkt.assignedAgentId || currentTkt.assignedAgentId === 'agt-104')) {
      setTimeout(() => {
        const botReply: TicketMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          senderName: 'Trueline Auto-Bot',
          message: `Thank you for your message: "${chatMessage.trim()}". Our human engineers are currently evaluating the diagnostic records. We will reply here shortly.`,
          createdAt: new Date().toISOString()
        };
        onAddMessage(activeTicketId, botReply);
      }, 1500);
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages?.length]);

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
        return <span className="text-[10px] uppercase font-bold text-[#0078d4]">● Medium</span>;
      case 'high':
        return <span className="text-[10px] uppercase font-bold text-[#d83b01]">● High</span>;
      case 'critical':
        return <span className="text-[10px] uppercase font-bold text-[#d13438] animate-pulse">● Critical</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f3f2f1] font-sans text-[#323130]">
      {/* Top Support Title & Sub Tab Header */}
      <div className="bg-white border-b border-[#edebe9] px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#323130] flex items-center gap-2">
            <Lucide.HelpCircle className="text-[#0078d4]" size={18} />
            Support Helpdesk
          </h1>
          <p className="text-xs text-[#605e5c]">Trueline Solution Client Service Center</p>
        </div>
        
        {/* Support Tab Switcher matching screenshot 1 */}
        <div className="flex border-b-2 border-transparent gap-6 h-full">
          <button
            onClick={() => {
              setActiveSubTab('help');
              setSelectedCategory(null);
            }}
            className={`pb-4 pt-2 text-sm font-bold tracking-wide relative transition-colors cursor-pointer ${
              activeSubTab === 'help' && !selectedCategory
                ? 'text-[#0078d4] border-b-2 border-[#0078d4]'
                : 'text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            Help
          </button>
          <button
            onClick={() => {
              setActiveSubTab('my_tickets');
              setSelectedCategory(null);
            }}
            className={`pb-4 pt-2 text-sm font-bold tracking-wide relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'my_tickets'
                ? 'text-[#0078d4] border-b-2 border-[#0078d4]'
                : 'text-[#605e5c] hover:text-[#323130]'
            }`}
          >
            My Tickets
            <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4] block"></span>
          </button>
        </div>

        {/* Link matching screenshot 1 */}
        <a 
          href="#learn-more" 
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#0078d4] hover:underline"
        >
          <Lucide.PlayCircle size={14} className="text-[#0078d4]" />
          Learn how to resolve issues on Trueline 365
        </a>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'help' && !selectedCategory && (
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Search Input matching screenshot 1 */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Issue, Custom Field, VoIP configuration, Webhook..."
                className="w-full bg-white border border-[#edebe9] rounded-sm px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4] focus:border-[#0078d4] shadow-sm text-[#323130]"
              />
              <Lucide.Search className="absolute left-3.5 top-3.5 text-[#605e5c]" size={16} />
            </div>

            {/* Select Issue Category Grid matching screenshot 1 */}
            <div>
              <h2 className="text-sm font-bold text-[#323130] uppercase tracking-wider mb-4">Select Issue Category</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-sm border border-[#edebe9] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                    >
                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[#323130] font-bold border-b border-[#f3f2f1] pb-2">
                          <span className="text-[#0078d4]">{getIcon(category.iconName)}</span>
                          <span className="text-sm font-bold">{category.title}</span>
                        </div>

                        {/* Top 3 issues */}
                        <div className="space-y-2">
                          {category.subCategories.slice(0, 3).map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => selectCategoryForTicket(category, sub)}
                              className="w-full text-left text-xs text-[#605e5c] hover:text-[#0078d4] py-1 flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span className="truncate pr-2">{sub}</span>
                              <Lucide.ChevronRight size={12} className="text-gray-300 group-hover:text-[#0078d4] shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* View All Bottom Bar */}
                      <button
                        onClick={() => selectCategoryForTicket(category)}
                        className="bg-[#f8f8f8] hover:bg-[#f3f2f1] text-[#0078d4] text-xs font-semibold text-left px-4 py-2.5 border-t border-[#edebe9] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span>View All Issues</span>
                        <Lucide.ChevronRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Note Footer */}
            <div className="bg-[#0078d4] text-white rounded-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-bold text-sm">Cannot find your specific issue category?</h3>
                <p className="text-xs text-blue-100">Raise a direct Priority ticket with our Trueline Core Engineering division.</p>
              </div>
              <button
                onClick={() => selectCategoryForTicket(categories[categories.length - 1])}
                className="bg-white hover:bg-[#f3f2f1] text-[#0078d4] font-bold text-xs px-4 py-2.5 rounded-sm shadow-sm cursor-pointer transition-colors"
              >
                File Direct Support Ticket
              </button>
            </div>
          </div>
        )}

        {/* Create Ticket Form */}
        {activeSubTab === 'help' && selectedCategory && (
          <div className="max-w-3xl mx-auto p-6">
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-xs font-bold text-[#605e5c] hover:text-[#0078d4] mb-4 cursor-pointer"
            >
              <Lucide.ArrowLeft size={14} />
              Back to Categories
            </button>

            <div className="bg-white rounded-sm border border-[#edebe9] shadow-md overflow-hidden">
              {/* Category Header Banner */}
              <div className="bg-[#0078d4] text-white p-5 flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-sm">
                  {getIcon(selectedCategory.iconName)}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200">Filing New Ticket</span>
                  <h2 className="text-base font-bold">{selectedCategory.title}</h2>
                </div>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitTicket} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#323130] uppercase mb-1.5">
                    Select Specific Sub-category
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full bg-[#f3f2f1] border border-[#edebe9] rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130]"
                  >
                    {selectedCategory.subCategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                    <option value="General inquiry">General Inquiry / Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#323130] uppercase mb-1.5">
                      Issue Subject / Title
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      placeholder="e.g., SIP trunk integration failure"
                      className="w-full bg-[#f3f2f1] border border-[#edebe9] rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#323130] uppercase mb-1.5">
                      Priority Level
                    </label>
                    <div className="w-full bg-[#fffdf0] text-[#d83b01] border border-[#d83b01]/15 px-3 py-2 text-xs rounded-sm font-semibold flex items-center gap-1.5 h-[34px]">
                      <span className="w-2 h-2 rounded-full bg-[#d83b01] inline-block animate-pulse"></span>
                      <span>High Priority (All tickets are automatically set to High)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#323130] uppercase mb-1.5">
                    Detail Description of the Issue
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Provide full description of standard error outputs, steps to recreate, or specific error codes..."
                    className="w-full bg-[#f3f2f1] border border-[#edebe9] rounded-sm p-3 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130] font-sans"
                  ></textarea>
                </div>

                {/* File Upload Component matching instructions */}
                <div>
                  <label className="block text-xs font-bold text-[#323130] uppercase mb-1.5">
                    Attachments (Diagnostic CSV, Logs, Screenshots)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-sm p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-[#0078d4] bg-[#f1faf1]'
                        : 'border-[#edebe9] hover:border-[#0078d4] bg-[#f8f8f8] hover:bg-[#f3f2f1]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Lucide.UploadCloud size={28} className={isDragging ? 'text-[#0078d4]' : 'text-gray-400'} />
                    <span className="text-xs font-bold text-[#323130] mt-2">
                      Drag and drop your logs or images here
                    </span>
                    <span className="text-[10px] text-[#605e5c] mt-1">
                      or click to browse local storage (Max 10MB)
                    </span>

                    {attachment && (
                      <div className="mt-3 bg-white border border-[#edebe9] rounded-sm px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs text-[#323130]">
                        <Lucide.FileText size={14} className="text-[#0078d4]" />
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

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 text-xs font-bold text-[#605e5c] hover:text-[#323130] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs px-6 py-2.5 rounded-sm shadow-sm cursor-pointer transition-colors"
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
          <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-sm border border-[#edebe9] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#edebe9] flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-[#323130] text-sm">Your Submitted Support Tickets</h3>
                <span className="text-xs text-[#605e5c] font-medium">Logged in as: <strong className="text-[#0078d4]">Rajesh Mehta</strong></span>
              </div>

              {tickets.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Lucide.Ticket size={36} className="text-gray-300" />
                  <p className="text-sm font-bold text-[#323130]">No tickets found</p>
                  <p className="text-xs text-[#605e5c]">You do not have any active or previous support tickets submitted.</p>
                  <button
                    onClick={() => setActiveSubTab('help')}
                    className="bg-[#0078d4] text-white text-xs font-bold px-4 py-2 rounded-sm cursor-pointer hover:bg-[#106ebe]"
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
                        <th className="p-4">Category</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-4 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3f2f1]">
                      {tickets.map((tkt) => (
                        <tr
                          key={tkt.id}
                          onClick={() => setActiveTicketId(tkt.id)}
                          className="hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-[#0078d4] pl-4">{tkt.id}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-[#323130] hover:text-[#0078d4] transition-colors text-sm truncate max-w-md">
                                {tkt.title}
                              </p>
                              <p className="text-[#605e5c] text-[11px] truncate max-w-sm mt-0.5">{tkt.description}</p>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-[#605e5c]">{categories.find(c => c.id === tkt.category)?.title || tkt.category}</td>
                          <td className="p-4">{getStatusBadge(tkt.status)}</td>
                          <td className="p-4 pr-4 text-right text-[#605e5c] font-medium whitespace-nowrap">
                            {new Date(tkt.createdAt).toLocaleDateString(undefined, {
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
                  className="flex items-center gap-1 text-xs font-bold text-[#605e5c] hover:text-[#0078d4] cursor-pointer"
                >
                  <Lucide.ChevronLeft size={16} />
                  Back to List
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0078d4] text-xs">{activeTicket.id}</span>
                  {getStatusBadge(activeTicket.status)}
                </div>
              </div>

              {/* Chat Body Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f3f2f1]">
                {/* Initial Ticket Desc Card */}
                <div className="bg-white border border-[#edebe9] rounded-sm p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#605e5c] uppercase">Initial Ticket Description</span>
                    <span className="text-[10px] text-[#605e5c] font-medium">
                      {new Date(activeTicket.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#323130] text-base">{activeTicket.title}</h3>
                  <p className="text-xs text-[#605e5c] leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>
                </div>

                {/* Conversation messages thread */}
                {activeTicket.messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="bg-white border border-[#edebe9] text-[#605e5c] text-[10px] font-bold px-3 py-1 rounded-sm text-center shadow-sm">
                          ⚙️ {msg.message}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-lg ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        isMe ? 'bg-[#0078d4]' : 'bg-[#252525]'
                      }`}>
                        {isMe ? 'RM' : 'TL'}
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-baseline gap-2 ${isMe ? 'justify-end' : ''}`}>
                          <span className="text-xs font-bold text-[#323130]">{msg.senderName}</span>
                          <span className="text-[9px] text-[#605e5c] font-semibold">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Speech Bubble */}
                        <div className={`p-3 rounded-sm text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#0078d4] text-white'
                            : 'bg-white text-[#323130] border border-[#edebe9]'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>

                          {/* Attachment Link if any */}
                          {msg.attachmentName && (
                            <div className={`mt-2 p-1.5 rounded-sm flex items-center gap-1.5 text-[10px] font-semibold border ${
                              isMe
                                ? 'bg-[#106ebe] text-blue-100 border-[#106ebe]/40'
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
                        <p className="text-[11px] text-[#605e5c] mb-2">Did the issue occur again or remains unresolved?</p>
                        <button
                          onClick={() => onReopenTicket?.(activeTicket.id)}
                          className="w-full bg-[#f3f2f1] hover:bg-[#edebe9] text-[#0078d4] border border-[#0078d4] font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors"
                        >
                          Reopen Ticket
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
                              size={26}
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
                            className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors"
                          >
                            Submit Rating & Close Ticket
                          </button>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#edebe9] text-center">
                        <p className="text-[11px] text-[#605e5c] mb-2">Still facing the issue?</p>
                        <button
                          onClick={() => onReopenTicket?.(activeTicket.id)}
                          className="w-full bg-white hover:bg-[#fdf2f2] text-[#d13438] border border-[#d13438] font-bold text-xs py-2 rounded-sm cursor-pointer transition-colors"
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
                    placeholder="Type a message to Trueline Support Desk..."
                    className="flex-1 bg-[#f3f2f1] border border-[#edebe9] rounded-sm px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#0078d4] focus:outline-none text-[#323130]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0078d4] text-white font-bold rounded-sm px-4 py-2 text-xs hover:bg-[#106ebe] transition-colors shrink-0 cursor-pointer"
                  >
                    Reply
                  </button>
                </form>
              )}
            </div>

            {/* Right side: Ticket Metadata Panel (Detailing Sidebar) */}
            <div className="w-full md:w-72 p-5 bg-white border-l border-[#edebe9] flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="space-y-5">
                {/* Meta details header */}
                <div>
                  <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest block">Ticket Info</span>
                  <h4 className="font-bold text-[#323130] text-sm mt-0.5">Summary Meta Logs</h4>
                </div>

                {/* Standard Progress bar based on ticket state */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#605e5c]">
                    <span>Progress Tracker</span>
                    <span>
                      {activeTicket.status === 'open' && '15%'}
                      {activeTicket.status === 'in_progress' && '50%'}
                      {activeTicket.status === 'pending' && '75%'}
                      {activeTicket.status === 'resolved' && '100%'}
                      {activeTicket.status === 'closed' && '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-[#f3f2f1] h-2 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeTicket.status === 'resolved' || activeTicket.status === 'closed'
                          ? 'bg-[#107c10] w-full'
                          : activeTicket.status === 'pending'
                          ? 'bg-[#0078d4] w-3/4'
                          : activeTicket.status === 'in_progress'
                          ? 'bg-[#ffb900] w-1/2'
                          : 'bg-[#d13438] w-1/6'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Metadata List block */}
                <div className="space-y-3 bg-[#f8f8f8] border border-[#edebe9] rounded-sm p-3.5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-[#605e5c] uppercase block">Category</span>
                    <span className="font-semibold text-[#323130]">
                      {categories.find(c => c.id === activeTicket.category)?.title || activeTicket.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#605e5c] uppercase block">Sub-Category</span>
                    <span className="font-semibold text-[#605e5c] leading-tight block mt-0.5">{activeTicket.subCategory}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#605e5c] uppercase block">Priority Level</span>
                    <div className="mt-0.5">{getPriorityBadge(activeTicket.priority)}</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#605e5c] uppercase block">Reported By</span>
                    <span className="font-semibold text-[#323130]">{activeTicket.customerName}</span>
                    <span className="text-[10px] text-[#605e5c] block">{activeTicket.customerEmail}</span>
                  </div>
                </div>

                {/* Assigned Support Agent */}
                <div className="bg-white border border-[#edebe9] rounded-sm p-3.5 shadow-sm text-xs">
                  <span className="text-[9px] font-bold text-[#605e5c] uppercase block mb-2">Assigned Engineer</span>
                  {activeTicket.assignedAgentId ? (
                    (() => {
                      const agent = MOCK_AGENTS.find(a => a.id === activeTicket.assignedAgentId);
                      if (!agent) return null;
                      return (
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-8 h-8 rounded-sm object-cover border border-[#edebe9]"
                          />
                          <div>
                            <p className="font-bold text-[#323130]">{agent.name}</p>
                            <p className="text-[10px] text-[#605e5c]">{agent.role}</p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Lucide.UserMinus size={16} />
                      <span className="font-medium text-[11px]">Awaiting Agent Assignment</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical disclaimer */}
              <div className="pt-4 text-[10px] text-gray-400 leading-relaxed text-center">
                All communications on Trueline 365 are logged, encrypted, and certified under ISO 27001 data safety regulations.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
