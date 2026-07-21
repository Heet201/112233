import React from 'react';
import * as Lucide from 'lucide-react';
import { MOCK_CONTACTS } from '../data';
import { Ticket } from '../types';

interface DashboardOverviewProps {
  tickets: Ticket[];
  onNavigateToSupport: () => void;
  isAgentMode: boolean;
}

export default function DashboardOverview({
  tickets,
  onNavigateToSupport,
  isAgentMode
}: DashboardOverviewProps) {
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f3f2f1] font-sans text-[#323130]">
      {/* Dashboard Top Header */}
      <div className="bg-white border-b border-[#edebe9] px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#323130] flex items-center gap-2">
            <Lucide.LayoutDashboard className="text-[#0078d4]" size={18} />
            365 CRM Dashboard
          </h1>
          <p className="text-xs text-[#605e5c] font-medium">Trueline Solutions Main Operational Feed</p>
        </div>
        <div className="text-xs font-semibold text-[#0078d4] bg-[#f3f2f1] border border-[#edebe9] px-3 py-1.5 rounded-sm">
          Live Status Sync Active
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Hero card - Geometric Balance corporate card style */}
        <div className="bg-white border border-[#edebe9] border-l-4 border-[#0078d4] rounded-sm p-6 text-[#323130] shadow-sm relative overflow-hidden">
          <div className="relative space-y-3 max-w-xl">
            <span className="bg-[#f3f2f1] text-[#0078d4] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 border border-[#edebe9] rounded-sm">
              Trueline Solutions Core Node
            </span>
            <h2 className="text-xl font-light text-[#323130] tracking-tight">
              Hello, Heet Dhameliya! Welcome back.
            </h2>
            <p className="text-xs text-[#605e5c] leading-relaxed">
              Your 365 CRM workspace is operating at 100% capacity. The Call Analyzer VoIP trunk is active, HRMS biometrics are syncing, and client support tickets are well within resolution SLAs.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onNavigateToSupport}
                className="bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs px-4 py-2 rounded-sm shadow-sm transition-colors cursor-pointer"
              >
                Manage Support Tickets
              </button>
              <span className="text-xs font-semibold text-[#605e5c]">
                {openCount + inProgressCount} urgent tickets waiting
              </span>
            </div>
          </div>
        </div>

        {/* CRM KPI Metrics - Geometric left border styled */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-[#0078d4] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-[#605e5c]">
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Sales Pipeline</span>
              <Lucide.TrendingUp size={16} className="text-[#0078d4]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-[#323130]">₹28,20,000</span>
              <span className="text-[10px] text-[#107c10] font-bold">+14.2%</span>
            </div>
            <p className="text-[10px] text-[#605e5c] font-medium">Across 5 enterprise contacts</p>
          </div>

          <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-[#d83b01] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-[#605e5c]">
              <span className="text-[10px] uppercase font-bold tracking-wider">Lead Funnel Vol.</span>
              <Lucide.Filter size={16} className="text-[#d83b01]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-[#323130]">142 Leads</span>
              <span className="text-[10px] text-[#107c10] font-bold">Hot Status</span>
            </div>
            <p className="text-[10px] text-[#605e5c] font-medium">9 active deals generated this week</p>
          </div>

          <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-[#107c10] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-[#605e5c]">
              <span className="text-[10px] uppercase font-bold tracking-wider">Outbound Call Volume</span>
              <Lucide.PhoneCall size={16} className="text-[#107c10]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-[#323130]">847 Calls</span>
              <span className="text-[10px] text-[#107c10] font-bold">92.4% Con.</span>
            </div>
            <p className="text-[10px] text-[#605e5c] font-medium">Trueline VoIP Dialers operating online</p>
          </div>

          <div className="bg-white p-4 rounded-sm border border-[#edebe9] border-l-4 border-[#d13438] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-[#605e5c]">
              <span className="text-[10px] uppercase font-bold tracking-wider">Support Desk Health</span>
              <Lucide.Activity size={16} className="text-[#d13438]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-[#d13438]">{openCount} Open</span>
              <span className="text-[10px] text-[#605e5c] font-semibold">{tickets.filter(t => t.status === 'resolved').length} Resolved</span>
            </div>
            <p className="text-[10px] text-[#605e5c] font-medium">Average CSAT rating is 4.9 Stars</p>
          </div>
        </div>

        {/* Visual Charts & Shortcut Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section: Contacts & Leads tracker */}
          <div className="bg-white p-5 rounded-sm border border-[#edebe9] shadow-sm lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f2f1] pb-3">
              <div>
                <h3 className="font-bold text-[#323130] text-sm">Key Client Contacts Ledger</h3>
                <p className="text-xs text-[#605e5c]">Top enterprise deals currently monitored in 365 CRM</p>
              </div>
              <span className="text-[11px] font-bold text-[#0078d4] bg-[#f3f2f1] px-2.5 py-1 border border-[#edebe9] rounded-sm">
                Verified CRM Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-[#605e5c] uppercase tracking-wider pb-2 border-b border-[#edebe9]">
                    <th className="py-2 pl-2">Contact Name</th>
                    <th className="py-2">Legal Enterprise</th>
                    <th className="py-2">Pipeline Status</th>
                    <th className="py-2 pr-2 text-right">Contract Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f2f1]">
                  {MOCK_CONTACTS.map((contact) => (
                    <tr key={contact.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="py-3 pl-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm bg-[#f3f2f1] text-[#0078d4] font-bold flex items-center justify-center text-[10px]">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-[#323130]">{contact.name}</p>
                          <p className="text-[9px] text-[#605e5c] -mt-0.5">{contact.email}</p>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-[#605e5c]">{contact.company}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold border ${
                          contact.status === 'Closed Won'
                            ? 'bg-[#f1faf1] text-[#107c10] border-[#107c10]/20'
                            : contact.status === 'Proposal Sent'
                            ? 'bg-[#f3f2f1] text-[#0078d4] border-[#0078d4]/10'
                            : 'bg-[#fff1f1] text-[#d13438] border-[#d13438]/10'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right font-bold text-[#323130]">{contact.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right section: System Shortcuts & Fast integrations */}
          <div className="bg-white p-5 rounded-sm border border-[#edebe9] shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-[#323130] text-sm">SIP & Proxy Configurations</h3>
              <p className="text-xs text-[#605e5c]">Outbound Call Analyzer trunk control</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f3f2f1] rounded-sm border border-[#edebe9] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#323130]">Jio SIP Trunk Host</p>
                  <p className="text-[10px] text-[#605e5c]">sip.jio.business:5060 (Active)</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#107c10]"></span>
              </div>

              <div className="p-3 bg-[#f3f2f1] rounded-sm border border-[#edebe9] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#323130]">Meta WhatsApp Gateway</p>
                  <p className="text-[10px] text-[#605e5c]">api.whatsapp.com/v16 (Ready)</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#107c10]"></span>
              </div>

              {/* Fast links panel */}
              <div className="pt-2 border-t border-[#edebe9] space-y-2">
                <p className="text-[10px] font-extrabold text-[#605e5c] uppercase tracking-widest">Fast Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onNavigateToSupport}
                    className="p-2.5 bg-[#f3f2f1] hover:bg-[#edebe9] border border-[#edebe9] text-[#323130] rounded-sm font-bold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-xs"
                  >
                    <Lucide.Ticket size={16} className="text-[#0078d4]" />
                    <span>Create Ticket</span>
                  </button>
                  <button
                    onClick={onNavigateToSupport}
                    className="p-2.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded-sm font-bold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-xs"
                  >
                    <Lucide.Users size={16} />
                    <span>Support Queue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
