import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomerPortal from './components/CustomerPortal';
import AgentPortal from './components/AgentPortal';
import DashboardOverview from './components/DashboardOverview';
import AdminLogin from './components/AdminLogin';
import SuperAdminPortal from './components/SuperAdminPortal';
import HelpdeskSetup from './components/HelpdeskSetup';
import SaaSPlatformSupport from './components/SaaSPlatformSupport';
import ShortUrlGeneratorModal from './components/ShortUrlGeneratorModal';
import { Ticket, TicketStatus, TicketPriority, TicketMessage, CategoryDetail, Tenant } from './types';
import { MOCK_TICKETS, MOCK_AGENTS, SUPPORT_CATEGORIES, INITIAL_TENANTS } from './data';

const STORAGE_KEY = 'trueline_365_crm_tickets_db_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAgentMode, setIsAgentMode] = useState<boolean>(true); // Start in Agent/Admin mode for easier discovery
  
  // 1. SaaS Role-playing State: super_admin (creator), company_admin (buyer), public_client (end user raising tickets)
  // Stored in sessionStorage so each browser tab/window can independently be Agent/Admin or Customer Helpdesk view
  const [currentRole, setCurrentRole] = useState<'super_admin' | 'company_admin' | 'public_client'>(() => {
    return (sessionStorage.getItem('trueline_crm_current_role') as any) || 'company_admin';
  });

  // 2. Tenants State
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('trueline_crm_tenants_list_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tenants list', e);
      }
    }
    return INITIAL_TENANTS;
  });

  // Helper to broadcast state changes across browser tabs/windows
  const broadcastSync = (type: 'SYNC_TICKETS' | 'SYNC_TENANTS', payload: any) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('trueline_crm_sync_channel_v1');
        bc.postMessage({ type, payload });
        bc.close();
      } catch (e) {
        // BroadcastChannel fallback
      }
    }
  };

  // 3. Current active Tenant ID context (isolated per tab session)
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    return sessionStorage.getItem('trueline_crm_current_tenant_id') || localStorage.getItem('trueline_crm_current_tenant_id') || 'custom';
  });

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

  // Save tenants whenever changed
  useEffect(() => {
    localStorage.setItem('trueline_crm_tenants_list_v1', JSON.stringify(tenants));
    broadcastSync('SYNC_TENANTS', tenants);
  }, [tenants]);

  // Save current role into tab session
  useEffect(() => {
    sessionStorage.setItem('trueline_crm_current_role', currentRole);
  }, [currentRole]);

  // Save acting tenant context into tab session
  useEffect(() => {
    sessionStorage.setItem('trueline_crm_current_tenant_id', currentTenantId);
  }, [currentTenantId]);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isTopShortenerOpen, setIsTopShortenerOpen] = useState<boolean>(false);

  // States for ticket tracking & real-time toast notifications
  const [activeAgentTicketId, setActiveAgentTicketId] = useState<string | null>(() => {
    return localStorage.getItem('trueline_agent_selected_ticket_id') || null;
  });

  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    customerName: string;
    tenantName: string;
    tenantId: string;
  } | null>(null);

  const [knownTicketIds, setKnownTicketIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => t.id);
        }
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_TICKETS.map(t => t.id);
  });

  // Real-time detection of newly created tickets (even across tabs via localStorage event)
  useEffect(() => {
    if (tickets.length === 0) return;

    // Find tickets that are not in knownTicketIds
    const newTickets = tickets.filter(t => !knownTicketIds.includes(t.id));

    if (newTickets.length > 0) {
      // Add new tickets to known list to avoid multi-triggers
      setKnownTicketIds(prev => [...prev, ...newTickets.map(t => t.id)]);

      // Take the most recent one
      const freshTicket = newTickets[0];

      // Ensure it was created very recently (within 25 seconds) to prevent triggering on page load/stale sync
      const createdTime = new Date(freshTicket.createdAt).getTime();
      const nowTime = Date.now();
      const isVeryRecent = Math.abs(nowTime - createdTime) < 25000;

      if (isVeryRecent) {
        // Retrieve tenant detail
        const matchedTenant = tenants.find(t => t.id === freshTicket.tenantId);
        const tenantName = matchedTenant ? matchedTenant.companyName : 'External Tenant';

        // Play dual-tone sound alert using Web Audio API
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Sound 1
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          gain1.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
          osc1.start();
          osc1.stop(audioCtx.currentTime + 0.25);

          // Sound 2
          setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
            gain2.gain.setValueAtTime(0.09, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.35);
          }, 110);
        } catch (soundErr) {
          console.warn('Audio feedback context disabled:', soundErr);
        }

        // Trigger gorgeous slide-in Toast UI
        setActiveToast({
          id: freshTicket.id,
          title: freshTicket.title,
          customerName: freshTicket.customerName,
          tenantName: tenantName,
          tenantId: freshTicket.tenantId
        });
      }
    }
  }, [tickets, knownTicketIds, tenants]);

  // URL Query/Hash Router for Direct Shareable Customer Links
  useEffect(() => {
    const checkUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const params = new URLSearchParams(search);

      let detectedTenantId = '';
      let shouldShowClientPortal = false;

      // 1. Check pathname (e.g., /helpdesk/tesla)
      if (path.includes('/helpdesk/')) {
        const parts = path.split('/helpdesk/');
        if (parts[1]) {
          detectedTenantId = parts[1].split('/')[0];
          shouldShowClientPortal = true;
        }
      }

      // 2. Check hash (e.g., #/helpdesk/tesla or #helpdesk-tesla)
      if (hash) {
        if (hash.includes('/helpdesk/')) {
          const parts = hash.split('/helpdesk/');
          if (parts[1]) {
            detectedTenantId = parts[1].split('/')[0];
            shouldShowClientPortal = true;
          }
        } else if (hash.includes('helpdesk-')) {
          const parts = hash.split('helpdesk-');
          if (parts[1]) {
            detectedTenantId = parts[1];
            shouldShowClientPortal = true;
          }
        }
      }

      // 3. Check search parameters (e.g., ?tenant=tesla or ?id=tesla)
      const tParam = params.get('tenant') || params.get('id');
      if (tParam) {
        detectedTenantId = tParam;
        shouldShowClientPortal = true;
      }

      if (detectedTenantId) {
        const cleanedId = detectedTenantId.trim();
        const matched = tenants.find(t => t.id.toLowerCase() === cleanedId.toLowerCase());
        if (matched) {
          setCurrentTenantId(matched.id);
        } else {
          setCurrentTenantId(cleanedId);
        }

        if (shouldShowClientPortal) {
          setCurrentRole('public_client');
          setIsAgentMode(false);
        }
      }
    };

    // Run on mount
    checkUrlRouting();

    // Listen to route updates
    window.addEventListener('popstate', checkUrlRouting);
    window.addEventListener('hashchange', checkUrlRouting);
    return () => {
      window.removeEventListener('popstate', checkUrlRouting);
      window.removeEventListener('hashchange', checkUrlRouting);
    };
  }, [tenants]);

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

  // Load tickets on mount and set up real-time cross-tab/cross-window sync (BroadcastChannel + storage + 800ms polling)
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

    // 1. BroadcastChannel API for 0ms latency sync across tabs/windows
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('trueline_crm_sync_channel_v1');
        bc.onmessage = (e) => {
          if (e.data?.type === 'SYNC_TICKETS' && Array.isArray(e.data.payload)) {
            setTickets(e.data.payload);
          }
          if (e.data?.type === 'SYNC_TENANTS' && Array.isArray(e.data.payload)) {
            setTenants(e.data.payload);
          }
        };
      } catch (err) {}
    }

    // 2. Storage event listener for standard window event sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setTickets(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync tickets from storage event', err);
        }
      }
      if (e.key === 'trueline_crm_tenants_list_v1' && e.newValue) {
        try {
          setTenants(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync tenants from storage event', err);
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

    // 3. Fast 800ms polling interval to guarantee sync in iframe sandboxes or separate windows
    const interval = setInterval(() => {
      const savedTickets = localStorage.getItem(STORAGE_KEY);
      if (savedTickets) {
        try {
          const parsed = JSON.parse(savedTickets);
          setTickets((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {}
      }

      const savedTenants = localStorage.getItem('trueline_crm_tenants_list_v1');
      if (savedTenants) {
        try {
          const parsed = JSON.parse(savedTenants);
          setTenants((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {}
      }
    }, 800);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  // Update branding details of tenant
  const handleUpdateTenant = (updated: Tenant) => {
    setTenants((prev) => {
      const updatedList = prev.map(t => t.id === updated.id ? updated : t);
      return updatedList;
    });
  };

  // Register a new tenant corporate subscriber
  const handleAddTenant = (newTenant: Tenant) => {
    setTenants((prev) => {
      return [...prev, newTenant];
    });

    // Seed a dynamic welcome ticket inside the new Tenant Helpdesk so they see how it routes
    const welcomeTicket: Ticket = {
      id: `${newTenant.id.toUpperCase().slice(0, 4)}-1001`,
      tenantId: newTenant.id,
      title: `SaaS Provisioning Checklist completed!`,
      description: `Welcome to 365 CRM SaaS. This support ticket was automatically registered to verify your shared customer link: ${window.location.origin}/helpdesk/${newTenant.id}. Clients using this link can file requests directly into this dashboard view.`,
      category: 'others',
      subCategory: 'Report general performance bug',
      status: 'open',
      priority: 'high',
      customerName: newTenant.ownerName,
      customerEmail: newTenant.ownerEmail,
      customerPhone: '+91 99988 88899',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'system',
          senderName: 'SaaS provisioning Desk',
          message: `Tenant configuration successfully deployed for ${newTenant.companyName} on plan: ${newTenant.plan}.`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    setTickets((prev) => {
      const updated = [welcomeTicket, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
  };

  // 1. Create a brand new ticket
  const handleCreateTicket = (newTicket: Ticket) => {
    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
  };

  // 2. Add a new conversational message to a ticket
  const handleAddMessage = (ticketId: string, message: TicketMessage) => {
    setTickets((prev) => {
      const updated = prev.map((tkt) => {
        if (tkt.id === ticketId) {
          return {
            ...tkt,
            updatedAt: new Date().toISOString(),
            messages: [...tkt.messages, message]
          };
        }
        return tkt;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
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

    setTickets((prev) => {
      const updated = prev.map((tkt) => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
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

    setTickets((prev) => {
      const updated = prev.map((tkt) => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
  };

  // 5. Assign support staff agent to a ticket
  const handleAssignAgent = (ticketId: string, agentId: string) => {
    const agent = MOCK_AGENTS.find((a) => a.id === agentId);
    const actorName = agent ? agent.name : 'Unassigned';
    
    const sysMsg: TicketMessage = {
      id: `sys-assign-${Date.now()}`,
      sender: 'system',
      senderName: 'System Log',
      message: `Ticket successfully re-allocated to Support Engineer: ${actorName}`,
      createdAt: new Date().toISOString()
    };

    setTickets((prev) => {
      const updated = prev.map((tkt) => {
        if (tkt.id === ticketId) {
          return {
            ...tkt,
            assignedAgentId: agentId || undefined,
            status: tkt.status === 'open' && agentId ? ('in_progress' as TicketStatus) : tkt.status,
            updatedAt: new Date().toISOString(),
            messages: [...tkt.messages, sysMsg]
          };
        }
        return tkt;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
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

    setTickets((prev) => {
      const updated = prev.map((tkt) => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
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

    setTickets((prev) => {
      const updated = prev.map((tkt) => {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync('SYNC_TICKETS', updated);
      return updated;
    });
  };

  // Multi-Tenant Isolation Filtering:
  const currentTenant = tenants.find(t => t.id.toLowerCase() === currentTenantId.toLowerCase()) || tenants[0];
  const tenantTickets = tickets.filter(t => !t.tenantId || t.tenantId.toLowerCase() === currentTenant.id.toLowerCase());

  // Active Open tickets count for Sidebar badge (Filtered by role!)
  const openCount = currentRole === 'super_admin'
    ? tickets.filter(t => t.raisedToSaaS && (t.status === 'open' || t.status === 'in_progress')).length
    : tenantTickets.filter(t => !t.raisedToSaaS && (t.status === 'open' || t.status === 'in_progress')).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf9f8] text-slate-800">
      
      {/* 🎛️ SYSTEM CONTROLLER STRIP: Unified sandbox switcher with perfect aesthetics */}
      <div className="bg-[#201f1e] text-white px-4 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-[#3b3a39] shrink-0 z-50 text-xs font-sans">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-xs uppercase tracking-wider">
            365 CRM SaaS
          </span>
          <span className="font-bold text-gray-400">Sandbox Environment Controller:</span>
        </div>

        {/* Roles Radio Panel */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setCurrentRole('super_admin');
              setIsAgentMode(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
              currentRole === 'super_admin'
                ? 'bg-indigo-600 text-white shadow-sm font-black'
                : 'bg-[#323130] text-gray-300 hover:bg-[#3b3a39]'
            }`}
          >
            <span>👑 SaaS Owner (Super Admin)</span>
          </button>

          <button
            onClick={() => {
              setCurrentRole('company_admin');
              setIsAgentMode(true);
              if (currentTab === 'helpdesk_setup') {
                // Keep it
              } else {
                setCurrentTab('dashboard');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
              currentRole === 'company_admin'
                ? 'bg-[#0078d4] text-white shadow-sm font-black'
                : 'bg-[#323130] text-gray-300 hover:bg-[#3b3a39]'
            }`}
          >
            <span>🏢 Subscriber (Company Admin)</span>
          </button>

          <button
            onClick={() => {
              setCurrentRole('public_client');
              setIsAgentMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
              currentRole === 'public_client'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'bg-[#323130] text-gray-300 hover:bg-[#3b3a39]'
            }`}
          >
            <span>🌐 Shared Helpdesk Link (Client View)</span>
          </button>

          <button
            onClick={() => {
              const domainLink = currentTenant.customDomain || `https://support.${currentTenantId}.com`;
              navigator.clipboard.writeText(domainLink).then(() => {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer border ${
              copiedLink
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-indigo-950 text-indigo-300 border-indigo-800 hover:bg-indigo-900'
            }`}
            title="Copy Branded Custom Link for clients"
          >
            <span>{copiedLink ? `✓ Copied Custom Link (${currentTenant.customDomain || `support.${currentTenantId}.com`})` : '📋 Copy Branded Custom Link'}</span>
          </button>

          <button
            onClick={() => setIsTopShortenerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
            title="Generate Temporary Short URL with Expiration Timer"
          >
            <span>⚡ Temporary Short URL</span>
          </button>
        </div>

        {/* Acting Tenant Switcher Dropdown */}
        <div className="flex items-center gap-1.5 font-sans">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acting Tenant:</span>
          <select
            value={currentTenantId}
            onChange={(e) => {
              setCurrentTenantId(e.target.value);
            }}
            className="bg-[#292827] text-white font-bold border border-gray-700 rounded-sm px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.companyName} ({t.plan})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER BODY BASED ON CURRENT SIMULATED SaaS ROLE */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* VIEW 1: PUBLIC CLIENT STANDALONE HELPDESK VIEW */}
        {currentRole === 'public_client' ? (
          <CustomerPortal
            tickets={tenantTickets}
            categories={categories}
            onCreateTicket={handleCreateTicket}
            onAddMessage={handleAddMessage}
            onRateTicket={handleRateTicket}
            onReopenTicket={handleReopenTicket}
            activeTenant={currentTenant}
            standalone={true}
            onBackToCRM={() => setCurrentRole('company_admin')}
          />
        ) : (
          /* OTHERWISE RENDER CRM WORKSPACE GRID (SIDEBAR + MAIN COMPONENT) */
          <>
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              openTicketsCount={openCount}
              isAgentMode={isAgentMode}
              setIsAgentMode={setIsAgentMode}
              isAdminLoggedIn={isAdminLoggedIn}
              currentRole={currentRole}
            />

            <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#f3f2f1]">
              
              {/* Force Admin Login if trying to access AgentPortal but logged out */}
              {isAgentMode && !isAdminLoggedIn ? (
                <AdminLogin
                  onLoginSuccess={handleAdminLoginSuccess}
                  onCancel={() => {
                    setIsAgentMode(false);
                    setCurrentRole('public_client');
                  }}
                />
              ) : currentRole === 'super_admin' ? (
                /* 👑 SUPER ADMIN VIEW */
                currentTab === 'support' ? (
                  <AgentPortal
                    tickets={tickets}
                    allTenants={tenants}
                    categories={categories}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdatePriority={handleUpdatePriority}
                    onAssignAgent={handleAssignAgent}
                    onAddMessage={handleAddMessage}
                    onLogout={handleAdminLogout}
                    onAddCategory={handleCreateCategory}
                    selectedTicketIdProp={activeAgentTicketId}
                    onSelectTicketProp={setActiveAgentTicketId}
                    onCreateSaaSTicket={handleCreateTicket}
                    tenant={tenants[0]}
                    initialInboxSource="saas"
                    isSuperAdmin={true}
                  />
                ) : (
                  <SuperAdminPortal
                    tenants={tenants}
                    tickets={tickets}
                    categories={categories}
                    onAddTenant={handleAddTenant}
                    onUpdateTenant={handleUpdateTenant}
                    onSelectTenant={(tenantId) => {
                      setCurrentTenantId(tenantId);
                      setCurrentRole('company_admin');
                      setCurrentTab('dashboard');
                    }}
                    onAddMessage={handleAddMessage}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdatePriority={handleUpdatePriority}
                    onAssignAgent={handleAssignAgent}
                    onAddCategory={handleCreateCategory}
                    onCreateSaaSTicket={handleCreateTicket}
                    initialTab="tenants"
                  />
                )
              ) : (
                /* 🏢 COMPANY ADMIN VIEW (SWITCHES DYNAMICALLY BY TAB) */
                <>
                  {currentTab === 'dashboard' && (
                    <DashboardOverview
                      tickets={tenantTickets.filter(t => !t.raisedToSaaS)}
                      onNavigateToSupport={() => setCurrentTab('support')}
                      onNavigateToSaaSSupport={() => setCurrentTab('saas_support')}
                      isAgentMode={isAgentMode}
                    />
                  )}

                  {currentTab === 'support' && (
                    <AgentPortal
                      tickets={tickets}
                      allTenants={tenants}
                      categories={categories}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdatePriority={handleUpdatePriority}
                      onAssignAgent={handleAssignAgent}
                      onAddMessage={handleAddMessage}
                      onLogout={handleAdminLogout}
                      onAddCategory={handleCreateCategory}
                      selectedTicketIdProp={activeAgentTicketId}
                      onSelectTicketProp={setActiveAgentTicketId}
                      onCreateSaaSTicket={handleCreateTicket}
                      tenant={currentTenant}
                      initialInboxSource="customer"
                    />
                  )}

                  {currentTab === 'helpdesk_setup' && (
                    <HelpdeskSetup
                      tenant={currentTenant}
                      onUpdateTenant={handleUpdateTenant}
                      onLaunchPublicView={() => {
                        setCurrentRole('public_client');
                      }}
                    />
                  )}

                  {currentTab === 'saas_support' && (
                    <AgentPortal
                      tickets={tickets}
                      allTenants={tenants}
                      categories={categories}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdatePriority={handleUpdatePriority}
                      onAssignAgent={handleAssignAgent}
                      onAddMessage={handleAddMessage}
                      onLogout={handleAdminLogout}
                      onAddCategory={handleCreateCategory}
                      selectedTicketIdProp={activeAgentTicketId}
                      onSelectTicketProp={setActiveAgentTicketId}
                      onCreateSaaSTicket={handleCreateTicket}
                      tenant={currentTenant}
                      initialInboxSource="saas"
                    />
                  )}
                </>
              )}
            </main>
          </>
        )}

      </div>

      {/* Real-time Toast Notification overlay */}
      {activeToast && (
        <div className="fixed bottom-20 right-4 z-[9999] bg-white border-l-4 border-l-[#0078d4] shadow-2xl rounded-sm p-4 w-96 border border-gray-200 font-sans">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="bg-[#f3f9fd] text-[#0078d4] p-1.5 rounded-sm shrink-0 flex items-center justify-center">
                <span>🔔</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  New Support Ticket Raised!
                </h4>
                <p className="text-[11px] font-bold text-[#0078d4] mt-0.5">
                  Tenant: {activeToast.tenantName}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">
                  {activeToast.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  By {activeToast.customerName} ({activeToast.id})
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              onClick={() => setActiveToast(null)}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-sm cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                // Switch tenant context
                setCurrentTenantId(activeToast.tenantId);
                
                // Set acting role to admin
                setCurrentRole('company_admin');
                setIsAgentMode(true);
                
                // Go to support tab
                setCurrentTab('support');
                
                // Open this specific ticket inside AgentPortal
                setActiveAgentTicketId(activeToast.id);
                
                // Clear toast
                setActiveToast(null);
              }}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm shadow-xs transition-colors cursor-pointer"
            >
              View & Reply Now
            </button>
          </div>
        </div>
      )}

      {/* Global Temporary Short URL Generator Modal */}
      <ShortUrlGeneratorModal
        isOpen={isTopShortenerOpen}
        onClose={() => setIsTopShortenerOpen(false)}
        tenant={currentTenant}
      />

      {/* Persistent floating Google AI Studio badge at the bottom-right */}
      <a
        href="https://ai.studio/build/d98d5434-a3ad-49f1-b6b8-480d8023f32a"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] text-white px-3.5 py-2 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-[11px] font-bold border border-white/20 select-none cursor-pointer"
        title="Open Project in Google AI Studio"
      >
        <div className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="tracking-wide">Google AI Studio</span>
      </a>
    </div>
  );
}
