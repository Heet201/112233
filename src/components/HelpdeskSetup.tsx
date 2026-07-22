import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { Tenant } from '../types';
import ShortUrlGeneratorModal from './ShortUrlGeneratorModal';

interface HelpdeskSetupProps {
  tenant: Tenant;
  onUpdateTenant: (updated: Tenant) => void;
  onLaunchPublicView: () => void;
}

export default function HelpdeskSetup({
  tenant,
  onUpdateTenant,
  onLaunchPublicView
}: HelpdeskSetupProps) {
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isShortenerOpen, setIsShortenerOpen] = useState(false);

  const themeColors = {
    blue: { bg: 'bg-[#0078d4]', text: 'text-[#0078d4]', hover: 'hover:bg-blue-50', ring: 'ring-blue-500', name: 'Trueline Blue' },
    emerald: { bg: 'bg-[#107c10]', text: 'text-[#107c10]', hover: 'hover:bg-emerald-50', ring: 'ring-emerald-500', name: 'Tesla Emerald' },
    slate: { bg: 'bg-[#323130]', text: 'text-[#323130]', hover: 'hover:bg-gray-100', ring: 'ring-gray-700', name: 'Cosmic Slate' },
    ruby: { bg: 'bg-[#d13438]', text: 'text-[#d13438]', hover: 'hover:bg-rose-50', ring: 'ring-rose-500', name: 'Acme Ruby Red' },
    orange: { bg: 'bg-[#d83b01]', text: 'text-[#d83b01]', hover: 'hover:bg-orange-50', ring: 'ring-orange-500', name: 'Solar Orange' },
  };

  const handleCopyLink = () => {
    const simulatedLink = `${window.location.origin}/?tenant=${tenant.id}`;
    navigator.clipboard.writeText(simulatedLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (key: keyof Tenant, value: any) => {
    const updated = { ...tenant, [key]: value };
    onUpdateTenant(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f3f2f1] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-[#edebe9] p-6 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-[#0078d4] rounded-sm">
                <Lucide.Link2 size={20} />
              </span>
              <h1 className="text-xl font-bold text-[#323130]">Shareable Helpdesk Public Link Configuration</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your clients don't use the full CRM interface. Share this simplified, company-branded Helpdesk URL to let them raise tickets and chat with your agents instantly.
            </p>
          </div>
          
          <button
            onClick={onLaunchPublicView}
            className="flex items-center gap-2 bg-[#0078d4] text-white px-4 py-2 text-xs font-bold rounded-sm shadow-sm hover:bg-[#106ebe] transition-all cursor-pointer"
          >
            <Lucide.ExternalLink size={14} />
            <span>Open Public Helpdesk Portal</span>
          </button>
        </div>

        {/* Configuration Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Branding and settings Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shareable Link Block & Custom Domain Configurator */}
            <div className="bg-white border border-[#edebe9] p-5 rounded-sm shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Lucide.Globe size={15} className="text-[#0078d4]" />
                  Helpdesk Domain & Public Link Settings
                </h3>
                <span className="text-[10px] bg-blue-50 text-[#0078d4] px-2 py-0.5 rounded font-bold border border-blue-100">
                  Custom Domain Ready
                </span>
              </div>

              {/* 1. Custom Domain Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Official Company Custom Domain (CNAME / White-Label)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ SSL Active</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tenant.customDomain || `https://support.${tenant.id}.com`}
                    onChange={(e) => updateField('customDomain', e.target.value)}
                    placeholder="https://support.yourcompany.com"
                    className="flex-1 text-xs border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-[#0078d4] font-mono font-bold text-[#0078d4]"
                  />
                  <button
                    onClick={() => {
                      const domain = tenant.customDomain || `https://support.${tenant.id}.com`;
                      navigator.clipboard.writeText(domain).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-2 bg-[#0078d4] text-white text-xs font-bold rounded-sm hover:bg-[#106ebe] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Lucide.Copy size={13} />
                    <span>Copy Custom Domain</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Replaces the temporary Google AI Studio / Cloud Run domain with your own branded website address.
                </p>
              </div>

              {/* 2. Link Variants Picker */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">Available Public Link Formats:</span>
                
                <div className="space-y-2">
                  {/* Option A: Custom Branded Domain */}
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="p-1 bg-blue-600 text-white rounded-xs text-[10px] font-black uppercase">Branded</span>
                      <span className="font-mono font-bold text-blue-900 truncate">
                        {tenant.customDomain || `https://support.${tenant.id}.com`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const link = tenant.customDomain || `https://support.${tenant.id}.com`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] font-bold text-[#0078d4] hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-2"
                    >
                      <Lucide.Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>

                  {/* Option B: Clean Shortened Vanity URL */}
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="p-1 bg-emerald-600 text-white rounded-xs text-[10px] font-black uppercase">Short URL</span>
                      <span className="font-mono font-bold text-emerald-900 truncate">
                        https://365crm.io/help/{tenant.id}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const link = `https://365crm.io/help/${tenant.id}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-2"
                    >
                      <Lucide.Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>

                  {/* Option C: Live Dev / Sandbox Link */}
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="p-1 bg-gray-600 text-white rounded-xs text-[10px] font-black uppercase">Sandbox</span>
                      <span className="font-mono text-gray-600 truncate">
                        {window.location.origin}/?tenant={tenant.id}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="text-[11px] font-bold text-gray-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-2"
                    >
                      <Lucide.Copy size={12} />
                      <span>Copy Sandbox Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Short URL Generator Launcher */}
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                    <Lucide.Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span>Need a Temporary Short URL with Expiration Timer?</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Generate temporary 24h/7-day short links (e.g. <code>365crm.io/s/acme-help</code>) for specific tickets or clients.
                  </p>
                </div>
                <button
                  onClick={() => setIsShortenerOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Lucide.Zap size={13} />
                  <span>Generate Short URL</span>
                </button>
              </div>

              {/* DNS setup callout */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lucide.ShieldAlert size={14} className="text-amber-600" />
                  <span>How to remove AI Studio / Cloud Run domain in production?</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Add a <strong>CNAME record</strong> in your domain provider (e.g., Cloudflare, GoDaddy, Namecheap):
                </p>
                <div className="font-mono text-[10px] bg-white p-1.5 border border-amber-200 rounded text-amber-900">
                  CNAME support.{tenant.id || 'company'}.com ➔ gateway.trueline365.com
                </div>
              </div>
            </div>

            {/* Custom Branding Panel */}
            <div className="bg-white border border-[#edebe9] p-5 rounded-sm shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Lucide.Palette size={14} className="text-[#0078d4]" />
                  Helpdesk Portal Branding
                </h3>
                {saveSuccess && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold animate-fade-in flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    Autosaved
                  </span>
                )}
              </div>

              {/* Company Logo Text & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Branded Logo Text</label>
                  <input
                    type="text"
                    value={tenant.logoText}
                    onChange={(e) => updateField('logoText', e.target.value)}
                    placeholder="e.g. TSLA, ACME, HR"
                    className="w-full text-xs border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#0078d4] font-bold"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Visible in the upper left corner of the helpdesk page.</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Support Inbound Email Address</label>
                  <input
                    type="email"
                    value={tenant.supportEmail}
                    onChange={(e) => updateField('supportEmail', e.target.value)}
                    placeholder="e.g. support@company.com"
                    className="w-full text-xs border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#0078d4]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Where auto-replies and alerts are routed.</span>
                </div>
              </div>

              {/* Welcome Titles */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Portal Main Welcome Headline</label>
                  <input
                    type="text"
                    value={tenant.headline}
                    onChange={(e) => updateField('headline', e.target.value)}
                    placeholder="e.g. How can we help you today?"
                    className="w-full text-xs border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Portal Sub-Headline / Guidance</label>
                  <textarea
                    value={tenant.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    rows={2}
                    placeholder="Provide friendly advice to users submitting a ticket."
                    className="w-full text-xs border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              {/* Theme Colors Grid */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Helpdesk Brand Accent Color</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(themeColors).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => updateField('themeColor', key)}
                      className={`p-2.5 border rounded-sm flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        tenant.themeColor === key
                          ? 'border-gray-900 bg-gray-50 ring-1 ' + info.ring
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${info.bg}`}></span>
                      <span className="truncate">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Portal Capabilities & Security */}
            <div className="bg-white border border-[#edebe9] p-5 rounded-sm shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 border-b border-gray-100 pb-3">
                <Lucide.ShieldCheck size={14} className="text-emerald-600" />
                Helpdesk Feature Capabilities
              </h3>

              <div className="space-y-3">
                {/* Drag Drop Attachments Toggle */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Allow Client File Attachments</span>
                    <span className="text-[10px] text-gray-400">Permit clients to drop and drag diagnostic logs or screenshots.</span>
                  </div>
                  <button
                    onClick={() => updateField('enableAttachments', !tenant.enableAttachments)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer focus:outline-none ${
                      tenant.enableAttachments ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      tenant.enableAttachments ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Simulated SLA Indicator */}
                <div className="flex items-center justify-between py-1 border-t border-gray-50 pt-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Enable Auto-Assignment AI Bot Routing</span>
                    <span className="text-[10px] text-gray-400">Instantly route critical status tickets to Trueline Auto-Bot.</span>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-sm">Always On</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Smartphone Mockup Live View */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="w-full text-center mb-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Lucide.Smartphone size={13} />
                Real-Time Client View Mockup
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5">As seen on a client’s mobile device screen</p>
            </div>

            {/* Smartphone Container frame */}
            <div className="relative w-76 h-[510px] bg-slate-900 rounded-[36px] shadow-xl border-[8px] border-slate-800 flex flex-col overflow-hidden select-none">
              
              {/* Speaker & camera notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-700 rounded-full mb-1"></div>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 bg-slate-50 pt-6 flex flex-col text-slate-800 overflow-hidden font-sans text-[10px]">
                
                {/* Header of mobile helpdesk */}
                <div className={`p-3 text-white flex items-center justify-between shrink-0 shadow-sm transition-colors ${themeColors[tenant.themeColor].bg}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-extrabold tracking-tighter">
                      {tenant.logoText || 'TL'}
                    </span>
                    <span className="font-bold tracking-tight text-[11px] truncate max-w-[100px]">{tenant.companyName}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 text-[8px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Support Online</span>
                  </div>
                </div>

                {/* Mini mobile body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  
                  {/* Headline */}
                  <div className="text-center py-2 space-y-1">
                    <h5 className="text-[12px] font-extrabold leading-tight tracking-tight text-slate-900">
                      {tenant.headline || 'How can we help?'}
                    </h5>
                    <p className="text-[9px] text-gray-500 leading-normal px-2">
                      {tenant.subtitle || 'Submit an inquiry or trace existing issues.'}
                    </p>
                  </div>

                  {/* Simulated Form Fields */}
                  <div className="bg-white border border-gray-100 p-2.5 rounded-sm shadow-xs space-y-2">
                    <div>
                      <div className="text-[8px] font-bold text-gray-400 mb-0.5">Select Help Category</div>
                      <div className="border border-gray-200 p-1.5 rounded-sm flex justify-between items-center bg-gray-50 text-[9px] text-gray-600">
                        <span>CRM Setup & Customization</span>
                        <Lucide.ChevronDown size={8} />
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-bold text-gray-400 mb-0.5">Your Full Name</div>
                      <div className="border border-gray-200 p-1.5 rounded-sm bg-gray-50 text-[8px] text-gray-300">
                        John Doe
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-bold text-gray-400 mb-0.5">Ticket Description</div>
                      <div className="border border-gray-200 p-1.5 rounded-sm bg-gray-50 h-10 text-[8px] text-gray-300">
                        Describe your concern in details...
                      </div>
                    </div>

                    {tenant.enableAttachments && (
                      <div className="border border-dashed border-gray-300 p-2 text-center bg-gray-50/50 rounded-sm text-[8px] text-gray-400">
                        📎 Attachment Upload Enabled
                      </div>
                    )}

                    <button className={`w-full text-white py-1.5 text-center font-bold rounded-xs cursor-default transition-colors ${themeColors[tenant.themeColor].bg}`}>
                      Create Support Ticket
                    </button>
                  </div>

                  {/* FAQ mock */}
                  <div className="text-[8px] space-y-1 text-gray-400">
                    <span className="font-bold text-gray-500 block uppercase tracking-wider">Helpdesk Contact</span>
                    <p>📧 Email: {tenant.supportEmail}</p>
                    <p>🕒 Response SLA: Within 4 hours</p>
                  </div>

                </div>

                {/* Phone bottom bar */}
                <div className="p-1 bg-white border-t border-gray-100 text-center text-[7px] text-gray-400 flex items-center justify-center gap-1">
                  <span>Powered by</span>
                  <span className="font-bold text-[#0078d4]">365 CRM SaaS</span>
                </div>

              </div>

              {/* Bottom home indicator line */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-700 rounded-full"></div>
            </div>

          </div>

        </div>

      </div>

      {/* Temporary Short URL Generator Modal */}
      <ShortUrlGeneratorModal 
        isOpen={isShortenerOpen}
        onClose={() => setIsShortenerOpen(false)}
        tenant={tenant}
      />
    </div>
  );
}
