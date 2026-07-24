import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { MOCK_TICKETS, INITIAL_TENANTS, SUPPORT_CATEGORIES } from './src/data';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const TICKETS_FILE = path.join(process.cwd(), 'tickets_db.json');
const TENANTS_FILE = path.join(process.cwd(), 'tenants_db.json');

// Helper functions for persistent storage
function loadTicketsStore(): any[] {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const data = fs.readFileSync(TICKETS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading TICKETS_FILE:', err);
  }
  return [...MOCK_TICKETS];
}

function saveTicketsStore(data: any[]) {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing TICKETS_FILE:', err);
  }
}

function loadTenantsStore(): any[] {
  try {
    if (fs.existsSync(TENANTS_FILE)) {
      const data = fs.readFileSync(TENANTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading TENANTS_FILE:', err);
  }
  return [...INITIAL_TENANTS];
}

function saveTenantsStore(data: any[]) {
  try {
    fs.writeFileSync(TENANTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing TENANTS_FILE:', err);
  }
}

// Central Server Memory Persistence
let ticketsStore = loadTicketsStore();
let tenantsStore = loadTenantsStore();
let categoriesStore = [...SUPPORT_CATEGORIES];

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/tickets', (req, res) => {
  res.json(ticketsStore);
});

app.post('/api/tickets', (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      if (item && item.id) {
        const existingIndex = ticketsStore.findIndex(t => t.id === item.id);
        if (existingIndex >= 0) {
          ticketsStore[existingIndex] = { ...ticketsStore[existingIndex], ...item };
        } else {
          ticketsStore.unshift(item);
        }
      }
    });
  } else if (payload && payload.id) {
    const existingIndex = ticketsStore.findIndex(t => t.id === payload.id);
    if (existingIndex >= 0) {
      ticketsStore[existingIndex] = { ...ticketsStore[existingIndex], ...payload };
    } else {
      ticketsStore.unshift(payload);
    }
  }
  saveTicketsStore(ticketsStore);
  res.json(ticketsStore);
});

app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  ticketsStore = ticketsStore.filter(t => t.id !== id);
  saveTicketsStore(ticketsStore);
  res.json(ticketsStore);
});

app.get('/api/tenants', (req, res) => {
  res.json(tenantsStore);
});

app.post('/api/tenants', (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      if (item && item.id) {
        const existingIndex = tenantsStore.findIndex(t => t.id === item.id);
        if (existingIndex >= 0) {
          tenantsStore[existingIndex] = { ...tenantsStore[existingIndex], ...item };
        } else {
          tenantsStore.push(item);
        }
      }
    });
  } else if (payload && payload.id) {
    const existingIndex = tenantsStore.findIndex(t => t.id === payload.id);
    if (existingIndex >= 0) {
      tenantsStore[existingIndex] = { ...tenantsStore[existingIndex], ...payload };
    } else {
      tenantsStore.push(payload);
    }
  }
  saveTenantsStore(tenantsStore);
  res.json(tenantsStore);
});

app.get('/api/categories', (req, res) => {
  res.json(categoriesStore);
});

app.post('/api/categories', (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    categoriesStore = payload;
  } else if (payload && payload.id) {
    const existingIndex = categoriesStore.findIndex((c: any) => c.id === payload.id);
    if (existingIndex >= 0) {
      categoriesStore[existingIndex] = { ...categoriesStore[existingIndex], ...payload };
    } else {
      categoriesStore.push(payload);
    }
  }
  res.json(categoriesStore);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
