import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { Tenant, Ticket } from '../types';

interface SuperAdminPortalProps {
  tenants: Tenant[];
  tickets: Ticket[];
  onAddTenant: (newTenant: Tenant) => void;
  onUpdateTenant: (updated: Tenant) => void;
  onSelectTenant: (tenantId: string) => void;
  onAddMessage?: (ticketId: string, message: any) => void;
  onUpdateStatus?: (ticketId: string, status: any) => void;
}

export default function SuperAdminPortal({
  tenants,
  tickets,
  onAddTenant,
  onUpdateTenant,
  onSelectTenant,
  onAddMessage,
  onUpdateStatus
}: SuperAdminPortalProps) {
  // New Tenant Form State
  const [compName, setCompName] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'Standard' | 'Premium' | 'Enterprise'>('Standard');
  const [theme, setTheme] = useState<'blue' | 'emerald' | 'slate' | 'ruby' | 'orange'>('blue');
  const [formSuccess, setFormSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Support Inbox States
  const [activeTab, setActiveTab] = useState<'tenants' | 'support'>('tenants');
  const [inboxSource, setInboxSource] = useState<'saas' | 'customer'>('saas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Calculate MRR (Monthly Recurring Revenue)
  const totalMrr = tenants.reduce((sum, t) => sum + (t.status === 'active' ? t.mrr : 0), 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !owner || !email) return;

    const id = compName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    
    // Default MRR mapping based on plan
    const mrrMap = { Standard: 149, Premium: 299, Enterprise: 499 };

    const newTenant: Tenant = {
      id,
      companyName: compName,
      ownerName: owner,
      ownerEmail: email,
      plan,
      status: 'active',
      mrr: mrrMap[plan],
      createdAt: new Date().toISOString(),
      themeColor: theme,
      headline: `${compName} Support Desk`,
      subtitle: `How can our support team assist you today? Please raise a support request.`,
      supportEmail: `help@${id}.com`,
      enableAttachments: true,
      logoText: compName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4)
    };

    onAddTenant(newTenant);
    setCompName('');
    setOwner('');
    setEmail('');
    setFormSuccess(`Registered ${compName} successfully!`);
    setTimeout(() => setFormSuccess(''), 3000);
  };

  const toggleTenantStatus = (tenant: Tenant) => {
    const updated: Tenant = {
      ...tenant,
      status: tenant.status === 'active' ? 'inactive' : 'active'
    };
    onUpdateTenant(updated);
  };

  const handlePlanChange = (tenant: Tenant, newPlan: 'Standard' | 'Premium' | 'Enterprise') => {
    const mrrMap = { Standard: 149, Premium: 299, Enterprise: 499 };
    const updated: Tenant = {
      ...tenant,
      plan: newPlan,
      mrr: mrrMap[newPlan]
    };
    onUpdateTenant(updated);
  };

  const filteredTenants = tenants.filter(t => 
    t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf9f8] p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-sm">
                <Lucide.ShieldCheck size={20} />
              </span>
              <h1 className="text-xl font-bold text-slate-950">👑 365 CRM SaaS Platform Super Admin Console</h1>
            </div>
            <p className="text-xs text-slate-500">
              White-label SaaS administration panel. Monitor subscription billing, manage B2B tenants, provision database records, and direct-login as company admins.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#f3f2f1] px-3 py-1.5 rounded-sm border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-600">MASTER CLOUD GATEWAY: OK</span>
          </div>
        </div>

        {/* High Level SaaS Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#0078d4] rounded-sm shrink-0">
              <Lucide.Building2 size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total B2B Tenants</span>
              <span className="text-2xl font-black text-slate-900">{tenants.length}</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">● {activeTenants} Active Subscribers</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-sm shrink-0">
              <Lucide.Banknote size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Combined SaaS MRR</span>
              <span className="text-2xl font-black text-slate-900">${totalMrr}/mo</span>
              <span className="text-[10px] text-gray-500 block">Average $315 per tenant</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-sm shrink-0">
              <Lucide.LifeBuoy size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Platform Tickets</span>
              <span className="text-2xl font-black text-slate-900">{tickets.length}</span>
              <span className="text-[10px] text-purple-600 font-bold block">
                {tickets.filter(t => t.raisedToSaaS).length} SaaS • {tickets.filter(t => !t.raisedToSaaS).length} Clients
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-sm shrink-0">
              <Lucide.Activity size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Platform Server Ping</span>
              <span className="text-2xl font-black text-slate-900">14 ms</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">99.99% Global SLA</span>
            </div>
          </div>

        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tenants'
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-gray-400 hover:text-slate-600'
            }`}
          >
            <Lucide.Building2 size={14} />
            <span>Corporate Tenants ({tenants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'support'
                ? 'border-purple-600 text-purple-600 font-black'
                : 'border-transparent text-gray-400 hover:text-slate-600'
            }`}
          >
            <Lucide.LifeBuoy size={14} />
            <span>SaaS Support Inbox</span>
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {tickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'tenants' ? (
          /* Operational Core: Tenants Management */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Block: Tenant List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                
                {/* Header with Search */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Manage Registered Corporate Customers (Tenants)</h2>
                    <p className="text-[11px] text-gray-400">Tenants lease your CRM software and configure their helpdesks.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Lucide.Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tenant or owner..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Tenant Rows Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4">Corporate Client</th>
                        <th className="p-4">Subscription Plan</th>
                        <th className="p-4">Monthly Lease</th>
                        <th className="p-4">Gateway Status</th>
                        <th className="p-4 text-right">Super Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTenants.map((t) => {
                        const tenantTickets = tickets.filter(tick => tick.tenantId === t.id && tick.raisedToSaaS);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[10px] ${
                                  t.themeColor === 'blue' ? 'bg-[#0078d4]' :
                                  t.themeColor === 'emerald' ? 'bg-[#107c10]' :
                                  t.themeColor === 'slate' ? 'bg-[#323130]' :
                                  t.themeColor === 'ruby' ? 'bg-[#d13438]' : 'bg-[#d83b01]'
                                }`}>
                                  {t.logoText || 'TL'}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 block">{t.companyName}</span>
                                  <span className="text-[10px] text-gray-400 block">Owner: {t.ownerName} ({t.ownerEmail})</span>
                                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-xs mt-0.5 inline-block">
                                    ID: {t.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <select
                                value={t.plan}
                                onChange={(e) => handlePlanChange(t, e.target.value as any)}
                                className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 font-semibold text-slate-700"
                              >
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Enterprise">Enterprise</option>
                              </select>
                            </td>
                            <td className="p-4 font-bold text-slate-800">
                              ${t.mrr}/mo
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => toggleTenantStatus(t)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full cursor-pointer flex items-center gap-1 border ${
                                  t.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {t.status === 'active' ? 'Active Gateway' : 'Suspended'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => onSelectTenant(t.id)}
                                className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-2.5 py-1 text-[11px] font-bold rounded-sm shadow-xs transition-all cursor-pointer"
                                title="Gain shell access to tenant crm dashboard"
                              >
                                <Lucide.KeyRound size={11} />
                                <span>Login as Admin</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Simulated Live Core Event Logs */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm shadow-sm space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <Lucide.Terminal size={12} className="text-emerald-500" />
                    Master SaaS Audit Gateway Logs
                  </span>
                  <span className="text-[9px] text-gray-500">Live feed</span>
                </div>
                <div className="text-[10px] text-slate-300 space-y-1.5 max-h-32 overflow-y-auto leading-normal">
                  <p className="text-gray-500">[2026-07-21 02:40:11] CRM SaaS Engine initialized on Cloud Run containers successfully.</p>
                  <p className="text-emerald-400">[2026-07-21 02:42:30] Tenant ACME CORP verified. Gasket failure complaints incoming.</p>
                  <p className="text-[#0078d4]">[2026-07-21 02:45:15] Public helpdesk for Tesla India pinged from client IP 142.250.77.46.</p>
                  <p className="text-amber-400">[2026-07-21 02:49:03] Plan changes successfully saved for Trueline Solutions.</p>
                  <p className="text-indigo-400">[2026-07-21 02:51:14] White-label credentials loaded: Heet Dhameliya set as Super Administrator.</p>
                </div>
              </div>

            </div>

            {/* Right Block: Register New Tenant */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Lucide.PlusCircle size={14} className="text-indigo-600" />
                    Sell CRM: Register Tenant
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Provide details of the business that purchased your software license.</p>
                </div>

                {formSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-semibold animate-fade-in flex items-center gap-1.5">
                    <Lucide.CheckCircle size={14} className="text-emerald-600" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateTenant} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Company / Business Name</label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. Reliance Retail, Apple India"
                      className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Owner / Administrator Name</label>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="e.g. Mukesh Ambani"
                      className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Primary Administrator Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@reliance.co.in"
                      className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">SaaS Plan Tier</label>
                      <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value as any)}
                        className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none bg-white"
                      >
                        <option value="Standard">Standard ($149)</option>
                        <option value="Premium">Premium ($299)</option>
                        <option value="Enterprise">Enterprise ($499)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Default Accent</label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none bg-white"
                      >
                        <option value="blue">Blue</option>
                        <option value="emerald">Emerald</option>
                        <option value="slate">Slate</option>
                        <option value="ruby">Ruby</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white p-2 text-xs font-bold rounded-sm shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Confirm Sale & Set Up Tenant
                  </button>
                </form>

              </div>
            </div>

          </div>
        ) : (
          /* Tab 2: SaaS Support Inbox */
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex min-h-[500px] h-[600px] overflow-hidden">
            
            {/* Inbox Left Sidebar */}
            <div className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50 font-sans">
              <div className="p-4 border-b border-slate-200 bg-white space-y-3.5">
                {/* Source Toggle */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Support Stream
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-sm">
                    <button
                      onClick={() => {
                        setInboxSource('saas');
                        setSelectedTicketId(null);
                      }}
                      className={`py-1.5 text-[10px] font-black uppercase rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        inboxSource === 'saas'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span>SaaS B2B</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] leading-none ${inboxSource === 'saas' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {tickets.filter(t => t.raisedToSaaS).length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setInboxSource('customer');
                        setSelectedTicketId(null);
                      }}
                      className={`py-1.5 text-[10px] font-black uppercase rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        inboxSource === 'customer'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span>Tenant Clients</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] leading-none ${inboxSource === 'customer' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {tickets.filter(t => !t.raisedToSaaS).length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Filter By Status
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((filter) => {
                      const count = tickets.filter((t) => {
                        const matchesSource = inboxSource === 'saas' ? t.raisedToSaaS : !t.raisedToSaaS;
                        const matchesStatus = filter === 'all' || t.status === filter;
                        return matchesSource && matchesStatus;
                      }).length;
                      return (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-colors cursor-pointer border ${
                            statusFilter === filter
                              ? inboxSource === 'saas' ? 'bg-purple-600 text-white border-purple-600' : 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white hover:bg-slate-200 text-slate-600 border-slate-200'
                          }`}
                        >
                          {filter.toUpperCase()} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* List Feed */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {tickets.filter((t) => {
                  const matchesSource = inboxSource === 'saas' ? t.raisedToSaaS : !t.raisedToSaaS;
                  const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                  return matchesSource && matchesStatus;
                }).length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-1 mt-6">
                    <Lucide.ShieldAlert size={28} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No tickets in this folder</p>
                    <p className="text-[10px]">No tickets match this status and source filter.</p>
                  </div>
                ) : (
                  tickets
                    .filter((t) => {
                      const matchesSource = inboxSource === 'saas' ? t.raisedToSaaS : !t.raisedToSaaS;
                      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                      return matchesSource && matchesStatus;
                    })
                    .map((t) => {
                      const isActive = t.id === selectedTicketId;
                      const tenantInfo = tenants.find(ten => ten.id === t.tenantId);
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`w-full text-left p-4 hover:bg-white transition-colors cursor-pointer block border-l-4 ${
                            isActive 
                              ? inboxSource === 'saas' ? 'bg-white border-l-purple-600' : 'bg-white border-l-indigo-600' 
                              : 'border-l-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-black ${inboxSource === 'saas' ? 'text-purple-600' : 'text-indigo-600'}`}>{t.id}</span>
                            <span className={`px-1.5 py-0.2 text-[8px] font-extrabold rounded-full uppercase ${
                              t.status === 'open' ? 'bg-amber-100 text-amber-800' :
                              t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-0.5">{t.title}</h4>
                          <p className="text-[10px] font-black text-slate-500 mb-1.5">
                            Tenant: {tenantInfo ? tenantInfo.companyName : t.tenantId}
                          </p>

                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>{t.category}</span>
                            {t.priority === 'critical' ? (
                              <span className="text-rose-600 font-bold uppercase">CRITICAL</span>
                            ) : (
                              <span className="uppercase">{t.priority}</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>

            {/* Inbox Right Chat Pane */}
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              {(() => {
                const selTkt = tickets.find(t => t.id === selectedTicketId);
                if (!selTkt) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
                      <Lucide.MailOpen size={36} className="text-slate-300" />
                      <h4 className="text-xs font-bold text-slate-700">No Ticket Selected</h4>
                      <p className="text-[10px] max-w-xs">Select a support ticket from the left column to view conversations, change statuses, and send replies.</p>
                    </div>
                  );
                }

                const tenantDetail = tenants.find(ten => ten.id === selTkt.tenantId);

                return (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
                    {/* Header bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{selTkt.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-indigo-600">
                            Subscriber: {tenantDetail ? tenantDetail.companyName : selTkt.tenantId}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold text-slate-900">{selTkt.title}</h2>
                      </div>

                      {/* Control Panel: Change Statuses */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Update Status:</span>
                        {(['open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => onUpdateStatus && onUpdateStatus(selTkt.id, st)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-sm uppercase tracking-wide cursor-pointer border ${
                              selTkt.status === st
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat log */}
                    <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
                      {selTkt.messages.map((msg) => {
                        const isSaaSReplier = msg.sender === 'agent' || msg.sender === 'system';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 max-w-xl ${isSaaSReplier ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                          >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-black text-[10px] text-white ${
                              isSaaSReplier ? 'bg-purple-600' : 'bg-indigo-600'
                            }`}>
                              {isSaaSReplier ? '👑' : tenantDetail?.logoText || 'US'}
                            </div>

                            {/* Message Bubble */}
                            <div className="space-y-1">
                              <div className={`flex items-baseline gap-2 ${isSaaSReplier ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] font-bold text-slate-700">
                                  {msg.senderName}
                                </span>
                                <span className="text-[8px] text-gray-400">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className={`p-3 rounded-sm text-xs shadow-xs leading-relaxed ${
                                isSaaSReplier
                                  ? 'bg-purple-600 text-white rounded-tr-none'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Message Box */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!replyText.trim() || !onAddMessage) return;

                        const newMessage = {
                          id: `msg-${Date.now()}`,
                          sender: 'agent' as const,
                          senderName: 'SaaS Super Admin (Heet Dhameliya)',
                          message: replyText.trim(),
                          createdAt: new Date().toISOString()
                        };

                        onAddMessage(selTkt.id, newMessage);
                        setReplyText('');

                        // Auto change status to in_progress if open
                        if (selTkt.status === 'open' && onUpdateStatus) {
                          onUpdateStatus(selTkt.id, 'in_progress');
                        }
                      }}
                      className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a response to this subscriber..."
                        className="flex-1 text-xs border border-slate-200 p-2.5 rounded-sm focus:outline-none focus:border-indigo-500 bg-slate-50 font-medium"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-sm font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Lucide.Send size={13} />
                        <span>Send Reply</span>
                      </button>
                    </form>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
