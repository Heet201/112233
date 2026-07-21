import React, { useState } from 'react';
import {
  LayoutDashboard,
  Filter,
  PhoneCall,
  AlarmClock,
  User,
  MessageSquare,
  FileText,
  ListChecks,
  Bookmark,
  Briefcase,
  Calendar,
  Calculator,
  Users,
  CreditCard,
  Settings,
  Database,
  PartyPopper,
  ChevronDown,
  ChevronRight,
  Ticket,
  ShieldAlert,
  Sliders,
  HelpCircle,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openTicketsCount: number;
  isAgentMode: boolean;
  setIsAgentMode: (mode: boolean) => void;
  isAdminLoggedIn?: boolean;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  openTicketsCount,
  isAgentMode,
  setIsAgentMode,
  isAdminLoggedIn
}: SidebarProps) {
  const [hrExpanded, setHrExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  return (
    <aside className="w-68 bg-[#252525] border-r border-[#3b3b3b] flex flex-col h-full overflow-y-auto select-none font-sans shrink-0 text-[#f3f2f1]">
      {/* Header with 365 CRM Logo */}
      <div className="p-4 border-b border-[#3b3b3b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Custom recreated logo with Geometric style */}
          <div className="relative bg-[#0078d4] rounded-sm p-1.5 w-10 h-10 flex flex-col items-center justify-center text-white shadow-md">
            {/* Tiny calendar loops */}
            <div className="absolute -top-1 left-2 w-1.5 h-2 bg-[#d13438] rounded-none"></div>
            <div className="absolute -top-1 right-2 w-1.5 h-2 bg-[#d13438] rounded-none"></div>
            <span className="text-[10px] font-bold tracking-tighter leading-none text-blue-100">365</span>
            <span className="text-[11px] font-extrabold uppercase tracking-tight -mt-0.5 leading-none">CRM</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-black text-2xl tracking-tighter text-white">365</span>
              <span className="font-sans font-black text-2xl tracking-tighter text-[#0078d4]">CRM</span>
            </div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-wider block -mt-1 uppercase">
              Trueline Solution
            </span>
          </div>
        </div>

        {/* Target circular status button */}
        <button 
          onClick={() => setIsAgentMode(!isAgentMode)}
          title="Switch Role Panel"
          className="w-8 h-8 rounded-full border border-[#3b3b3b] flex items-center justify-center hover:bg-[#3b3b3b] text-gray-300 transition-colors cursor-pointer relative group"
        >
          <div className="w-4.5 h-4.5 rounded-full border-2 border-[#0078d4] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#107c10] animate-pulse"></div>
          </div>
          <span className="absolute left-10 bg-[#323130] text-white text-[10px] font-semibold py-1 px-2 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50">
            Switch to {isAgentMode ? 'Client Portal' : 'Agent Panel'}
          </span>
        </button>
      </div>

      {/* Role Switcher Pill Container with Geometric theme */}
      <div className="p-3 bg-[#1e1e1e] border-b border-[#3b3b3b]">
        <div className="bg-[#252525] p-0.5 rounded-sm border border-[#3b3b3b] flex items-center shadow-inner">
          <button
            onClick={() => setIsAgentMode(false)}
            className={`flex-1 text-center py-1.5 px-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
              !isAgentMode
                ? 'bg-[#0078d4] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#3b3b3b]'
            }`}
          >
            Client Portal
          </button>
          <button
            onClick={() => setIsAgentMode(true)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
              isAgentMode
                ? 'bg-[#0078d4] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#3b3b3b]'
            }`}
          >
            <span>CRM Agent</span>
            {isAdminLoggedIn ? (
              <span className="text-[8px] bg-[#107c10]/20 text-[#107c10] px-1 rounded-sm">Active</span>
            ) : (
              <span className="text-[8px] bg-amber-500/15 text-amber-500 px-1 rounded-sm">Secure</span>
            )}
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* MAIN CATEGORY */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase px-3 pb-1">
            Main
          </p>
          
          {/* Active indicator or Dashboard */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#0078d4] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#3b3b3b]'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={17} className={currentTab === 'dashboard' ? 'text-white' : 'text-[#0078d4]'} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Highlighted Support Ticket Entry */}
          <button
            onClick={() => setCurrentTab('support')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-semibold transition-all cursor-pointer relative ${
              currentTab === 'support'
                ? 'bg-[#0078d4] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#3b3b3b]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Ticket size={17} className={currentTab === 'support' ? 'text-white' : 'text-[#0078d4]'} />
              <span>Support Tickets</span>
            </div>
            {openTicketsCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm leading-none ${
                currentTab === 'support' ? 'bg-white text-[#0078d4]' : 'bg-[#d13438] text-white'
              }`}>
                {openTicketsCount}
              </span>
            )}
          </button>

          {/* Helpdesk Shareable Link Configuration Tab */}
          {isAgentMode && (
            <button
              onClick={() => setCurrentTab('helpdesk_setup')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'helpdesk_setup'
                  ? 'bg-gradient-to-r from-[#0078d4] to-indigo-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-[#3b3b3b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders size={17} className={currentTab === 'helpdesk_setup' ? 'text-white' : 'text-[#ffb900]'} />
                <span>Helpdesk Public Link</span>
              </div>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded-sm">LIVE</span>
            </button>
          )}

          {/* SaaS Support Ticket Access */}
          <button
            onClick={() => setCurrentTab('saas_support')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'saas_support'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#3b3b3b]'
            }`}
          >
            <div className="flex items-center gap-3">
              <LifeBuoy size={17} className={currentTab === 'saas_support' ? 'text-white' : 'text-purple-400'} />
              <span>SaaS Support & Help</span>
            </div>
          </button>

          {/* Other simulated CRM items matching image 2 */}
          <div className="opacity-60 space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Filter size={17} className="text-amber-500" />
              <span>Lead</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <PhoneCall size={17} className="text-emerald-500" />
              <span>Call Analyzer</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <AlarmClock size={17} className="text-[#d13438]" />
              <span>Reminder</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <User size={17} className="text-amber-500" />
              <span>Meeting</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <MessageSquare size={17} className="text-emerald-500" />
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* PRODUCTIVITY CATEGORY */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase px-3 pb-1">
            Productivity
          </p>
          <div className="opacity-60 space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Calendar size={17} className="text-teal-500" />
              <span>Task</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <ListChecks size={17} className="text-[#0078d4]" />
              <span>To Do</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Bookmark size={17} className="text-pink-400" />
              <span>Notes</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Briefcase size={17} className="text-sky-400" />
              <span>Project Management</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Calendar size={17} className="text-rose-400" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* BUSINESS CATEGORY */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase px-3 pb-1">
            Business
          </p>
          <div className="opacity-60 space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Calculator size={17} className="text-slate-400" />
              <span>Accounting</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <Users size={17} className="text-amber-400" />
              <span>Customer</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">
              <CreditCard size={17} className="text-orange-400" />
              <span>Invoice</span>
            </button>
          </div>
        </div>

        {/* TEAM OPERATIONS */}
        <div className="space-y-1">
          <button
            onClick={() => setHrExpanded(!hrExpanded)}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-gray-400 tracking-widest uppercase hover:text-white cursor-pointer"
          >
            <span>Team Operations</span>
            {hrExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {hrExpanded && (
            <div className="pl-2 space-y-0.5">
              <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-300 bg-[#3b3b3b]/50 rounded-sm">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80"
                    alt="HR"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>HR Manager</span>
              </div>
              <div className="pl-8 space-y-0.5 text-xs text-gray-400 opacity-80">
                <div className="py-1 px-2 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">○ Staff</div>
                <div className="py-1 px-2 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">○ Attendance</div>
                <div className="py-1 px-2 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">○ Leave</div>
                <div className="py-1 px-2 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">○ Recruitment</div>
                <div className="py-1 px-2 hover:bg-[#3b3b3b] hover:text-white rounded-sm cursor-not-allowed">○ Reports</div>
              </div>
            </div>
          )}
        </div>

        {/* TOOLS & SETTINGS */}
        <div className="space-y-1">
          <button
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-gray-400 tracking-widest uppercase hover:text-white cursor-pointer"
          >
            <span>Tools & Settings</span>
            {settingsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {settingsExpanded && (
            <div className="pl-2 space-y-0.5 text-xs text-gray-400">
              <div className="flex items-center gap-3 px-3 py-2 opacity-50 cursor-not-allowed">
                <Database size={14} className="text-purple-400" />
                <span>Storage</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 opacity-50 cursor-not-allowed">
                <PartyPopper size={14} className="text-pink-400" />
                <span>Greetings</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-[#3b3b3b] text-white rounded-sm cursor-not-allowed">
                <Settings size={14} className="text-[#0078d4]" />
                <span className="font-semibold">General Settings</span>
              </div>
              <div className="pl-8 space-y-0.5 text-[11px] text-gray-400 opacity-80">
                <div className="py-1">Web Settings</div>
                <div className="py-1">Lead Settings</div>
                <div className="py-1">HRMS Settings</div>
                <div className="py-1">Integrations</div>
                <div className="py-1">Lead Trash</div>
                <div className="py-1">Attributes</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-3 bg-[#1e1e1e] border-t border-[#3b3b3b] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <HelpCircle size={12} />
          <span>Need Help?</span>
        </div>
        <span className="font-semibold text-[#0078d4]">v3.65.1</span>
      </div>
    </aside>
  );
}
