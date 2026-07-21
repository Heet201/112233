import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomerPortal from './components/CustomerPortal';
import AgentPortal from './components/AgentPortal';
import DashboardOverview from './components/DashboardOverview';
import AdminLogin from './components/AdminLogin';
import { Ticket, TicketStatus, TicketPriority, TicketMessage, CategoryDetail } from './types';
import { MOCK_TICKETS, MOCK_AGENTS, SUPPORT_CATEGORIES } from './data';

const STORAGE_KEY = 'trueline_365_crm_tickets_db_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAgentMode, setIsAgentMode] = useState<boolean>(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('trueline_crm_admin_logged_in') === 'true';
  });
  
  const [categories, setCategories] = useState<CategoryDetail[]>(() => {
    const saved = localStorage.getItem('trueline_365_crm_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse categories', e);
      }
    }
    return SUPPORT_CATEGORIES;
  });

  const handleCreateCategory = (newCat: CategoryDetail) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('trueline_365_crm_categories', JSON.stringify(updated));
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('trueline_crm_admin_logged_in', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('trueline_crm_admin_logged_in');
    setIsAgentMode(false);
  };

  // Load tickets on mount and set up tab sync
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved tickets database', e);
        setTickets(MOCK_TICKETS);
      }
    } else {
      setTickets(MOCK_TICKETS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TICKETS));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setTickets(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync tickets from storage event', err);
        }
      }
      if (e.key === 'trueline_365_crm_categories' && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync categories from storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save tickets state changes to localStorage
  const saveTickets = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
  };

  // 1. Create a brand new ticket
  const handleCreateTicket = (newTicket: Ticket) => {
    const updated = [newTicket, ...tickets];
    saveTickets(updated);
  };

  // 2. Add a new conversational message to a ticket
  const handleAddMessage = (ticketId: string, message: TicketMessage) => {
    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, message]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // 3. Update Status of a ticket (And append system audit message)
  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    const activeStaff = 'Heet Dhameliya'; // Admin actor
    const sysMsg: TicketMessage = {
      id: `sys-status-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `${activeStaff} changed ticket status parameters to: ${status.toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          status,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, sysMsg]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // 4. Update Priority of a ticket (And append system audit message)
  const handleUpdatePriority = (ticketId: string, priority: TicketPriority) => {
    const activeStaff = 'Heet Dhameliya';
    const sysMsg: TicketMessage = {
      id: `sys-prio-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `${activeStaff} updated ticket severity tier to: ${priority.toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          priority,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, sysMsg]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // 5. Assign support staff agent to a ticket
  const handleAssignAgent = (ticketId: string, agentId: string) => {
    const agent = MOCK_AGENTS.find((a) => a.id === agentId);
    const actorName = agent ? agent.name : 'Unassigned';
    
    const sysMsg: TicketMessage = {
      id: `sys-assign-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `Ticket successfully re-allocated to Trueline Support Engineer: ${actorName}`,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          assignedAgentId: agentId || undefined,
          // If status was open, shift it automatically to In Progress upon assignment!
          status: tkt.status === 'open' && agentId ? ('in_progress' as TicketStatus) : tkt.status,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, sysMsg]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // 6. Submit user rating and feedback for resolved tickets
  const handleRateTicket = (ticketId: string, rating: number, feedback: string) => {
    const sysMsg: TicketMessage = {
      id: `sys-rating-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `Client submitted a ${rating}-star feedback satisfaction report. Case closed successfully.`,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          rating,
          feedback,
          status: 'closed' as TicketStatus,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, sysMsg]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // 7. Reopen a ticket from Customer Portal
  const handleReopenTicket = (ticketId: string) => {
    const sysMsg: TicketMessage = {
      id: `sys-reopen-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `The client has reopened this ticket. Status reset to OPEN.`,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map((tkt) => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          status: 'open' as TicketStatus,
          rating: undefined,
          feedback: undefined,
          updatedAt: new Date().toISOString(),
          messages: [...tkt.messages, sysMsg]
        };
      }
      return tkt;
    });
    saveTickets(updated);
  };

  // Active Open tickets count for Sidebar badge
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800">
      {/* 365 CRM Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openTicketsCount={openCount}
        isAgentMode={isAgentMode}
        setIsAgentMode={setIsAgentMode}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main operational panel */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {isAgentMode && !isAdminLoggedIn ? (
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onCancel={() => {
              setIsAgentMode(false);
            }}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardOverview
            tickets={tickets}
            onNavigateToSupport={() => setCurrentTab('support')}
            isAgentMode={isAgentMode}
          />
        ) : isAgentMode ? (
          <AgentPortal
            tickets={tickets}
            categories={categories}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
            onAssignAgent={handleAssignAgent}
            onAddMessage={handleAddMessage}
            onLogout={handleAdminLogout}
            onAddCategory={handleCreateCategory}
          />
        ) : (
          <CustomerPortal
            tickets={tickets}
            categories={categories}
            onCreateTicket={handleCreateTicket}
            onAddMessage={handleAddMessage}
            onRateTicket={handleRateTicket}
            onReopenTicket={handleReopenTicket}
          />
        )}
      </main>
    </div>
  );
}
