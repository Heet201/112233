import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Tenant } from '../types';

interface ShortUrlItem {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  domain: string;
  createdAt: string;
  expiresIn: string;
  clicks: number;
  hasPassword?: boolean;
}

interface ShortUrlGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
}

export default function ShortUrlGeneratorModal({
  isOpen,
  onClose,
  tenant
}: ShortUrlGeneratorModalProps) {
  const defaultTarget = tenant 
    ? `${window.location.origin}/?tenant=${tenant.id}`
    : window.location.href;

  const [targetUrl, setTargetUrl] = useState(defaultTarget);
  const [domain, setDomain] = useState('365crm.io/s/');
  const [customSlug, setCustomSlug] = useState('');
  const [expiry, setExpiry] = useState('7_days');
  const [requirePassword, setRequirePassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQrFor, setShowQrFor] = useState<string | null>(null);

  // Saved short URLs in state
  const [links, setLinks] = useState<ShortUrlItem[]>(() => {
    try {
      const saved = localStorage.getItem('trueline_crm_short_links');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 's1',
        originalUrl: `${window.location.origin}/?tenant=${tenant?.id || 'custom'}`,
        shortUrl: `https://365crm.io/s/${tenant?.id || 'help'}-desk`,
        slug: `${tenant?.id || 'help'}-desk`,
        domain: '365crm.io/s/',
        createdAt: '2026-07-22 10:15 AM',
        expiresIn: '30 Days',
        clicks: 24,
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('trueline_crm_short_links', JSON.stringify(links));
    } catch (e) {
      // ignore
    }
  }, [links]);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = customSlug.trim() || Math.random().toString(36).substring(2, 7);
    const short = `https://${domain}${slug}`;
    
    const expiryText = 
      expiry === '24_hours' ? '24 Hours' :
      expiry === '7_days' ? '7 Days' :
      expiry === '30_days' ? '30 Days' : 'Never (Permanent)';

    const newLink: ShortUrlItem = {
      id: 's_' + Date.now(),
      originalUrl: targetUrl,
      shortUrl: short,
      slug,
      domain,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      expiresIn: expiryText,
      clicks: 0,
      hasPassword: requirePassword
    };

    setLinks([newLink, ...links]);
    setCustomSlug('');
    setCopiedId(newLink.id);
    navigator.clipboard.writeText(newLink.shortUrl).catch(() => {});
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDelete = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-md shadow-2xl border border-[#edebe9] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1b1a19] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#0078d4] text-white rounded-xs">
              <Lucide.Zap size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Temporary Short URL Generator
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  ⚡ Instant Shortener
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Create clean, temporary short links with custom aliases & expiration timers
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-all cursor-pointer"
          >
            <Lucide.X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#f8f9fa]">
          
          {/* Create New Link Form */}
          <form onSubmit={handleGenerate} className="bg-white p-5 border border-[#edebe9] rounded-sm shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Lucide.Link size={14} className="text-[#0078d4]" />
              Generate New Short Link
            </h3>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Destination Target URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs border border-gray-300 p-2.5 rounded-sm font-mono focus:outline-none focus:border-[#0078d4] bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setTargetUrl(`${window.location.origin}/?tenant=${tenant?.id || 'custom'}`)}
                  className="px-3 py-2 text-[11px] font-bold bg-blue-50 text-[#0078d4] border border-blue-200 rounded-sm hover:bg-blue-100 whitespace-nowrap cursor-pointer shrink-0"
                >
                  Use Tenant Helpdesk URL
                </button>
              </div>
            </div>

            {/* Domain & Custom Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Domain Prefix
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2.5 rounded-sm font-mono font-bold text-[#0078d4] bg-white focus:outline-none focus:border-[#0078d4] cursor-pointer"
                >
                  <option value="365crm.io/s/">365crm.io/s/ (Official Short)</option>
                  <option value="trueline.link/">trueline.link/ (Branded Link)</option>
                  <option value="tiny.link/">tiny.link/ (Global Shortener)</option>
                  <option value="help.tl/">help.tl/ (Helpdesk Direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Custom Alias / Short Slug <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. acme-help or ticket-102"
                  className="w-full text-xs border border-gray-300 p-2.5 rounded-sm font-mono focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Expiration & Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Lucide.Clock size={12} className="text-amber-600" />
                  Link Expiration Timer
                </label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-[#0078d4] cursor-pointer"
                >
                  <option value="24_hours">⏳ 24 Hours (Temporary Link)</option>
                  <option value="7_days">📅 7 Days (Weekly Access)</option>
                  <option value="30_days">🗓️ 30 Days (Monthly Campaign)</option>
                  <option value="never">♾️ Permanent (No Expiration)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-sm p-2.5 bg-gray-50/60 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <Lucide.Lock size={15} className="text-gray-500" />
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Passcode Lock</span>
                    <span className="text-[10px] text-gray-400">Require PIN code to open link</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="w-4 h-4 text-[#0078d4] rounded focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0078d4] text-white px-6 py-2.5 text-xs font-bold rounded-sm shadow-sm hover:bg-[#106ebe] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lucide.Zap size={14} />
                <span>Generate Short URL & Copy</span>
              </button>
            </div>
          </form>

          {/* List of Generated Links */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Lucide.BarChart2 size={14} className="text-emerald-600" />
                Active Generated Short URLs ({links.length})
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">
                Stored in local session
              </span>
            </div>

            {links.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-gray-300 rounded-sm">
                <Lucide.Link2 size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">No active short URLs generated yet.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Use the generator above to shorten any helpdesk or ticket link.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {links.map((item) => (
                  <div key={item.id} className="bg-white border border-[#edebe9] p-3.5 rounded-sm shadow-2xs hover:border-blue-300 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-xs font-mono font-bold text-[#0078d4] bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 truncate">
                          <Lucide.ExternalLink size={12} />
                          {item.shortUrl}
                        </span>
                        {item.hasPassword && (
                          <span className="p-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-200" title="Password Protected">
                            🔒 PIN Protected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopy(item.id, item.shortUrl)}
                          className={`px-3 py-1 text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-all ${
                            copiedId === item.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Lucide.Check size={12} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Lucide.Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setShowQrFor(showQrFor === item.id ? null : item.id)}
                          className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xs flex items-center gap-1 cursor-pointer"
                          title="Generate QR Code"
                        >
                          <Lucide.QrCode size={13} />
                          <span>QR</span>
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent('Here is your support link: ' + item.shortUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                          title="Share on WhatsApp"
                        >
                          <Lucide.Share2 size={12} />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                          title="Delete short link"
                        >
                          <Lucide.Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 border-t border-gray-100 pt-2 font-mono">
                      <span className="truncate max-w-xs text-gray-400" title={item.originalUrl}>
                        Target: {item.originalUrl}
                      </span>
                      <span>• Created: {item.createdAt}</span>
                      <span>• Expires: <strong className="text-amber-700">{item.expiresIn}</strong></span>
                      <span>• Clicks: <strong className="text-emerald-700">{item.clicks}</strong></span>
                    </div>

                    {/* QR Code preview block */}
                    {showQrFor === item.id && (
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-center animate-fade-in flex flex-col items-center gap-2">
                        <p className="text-xs font-bold text-gray-700">QR Code for {item.shortUrl}</p>
                        <div className="p-2 bg-white border border-gray-300 rounded shadow-xs inline-block">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(item.shortUrl)}`} 
                            alt="QR Code" 
                            className="w-32 h-32"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">Scan with any mobile camera to open helpdesk</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 border-t border-[#edebe9] flex justify-between items-center text-xs text-gray-500">
          <span>💡 Temporary links automatically redirect clients to your designated CRM Tenant Public Link.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-sm hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
