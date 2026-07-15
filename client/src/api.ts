const BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: getHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  dashboard: {
    get: () => request<any>('/dashboard'),
  },
  fleet: {
    list: () => request<any[]>('/fleet'),
  },
  vehicles: {
    list: (status?: string) => request<any[]>(`/vehicles${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<any>(`/vehicles/${id}`),
    create: (data: any) => request<any>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/vehicles/${id}`, { method: 'DELETE' }),
  },
  drivers: {
    list: (status?: string) => request<any[]>(`/drivers${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<any>(`/drivers/${id}`),
    create: (data: any) => request<any>('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/drivers/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request<any[]>('/customers'),
    create: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  bookings: {
    list: (status?: string) => request<any[]>(`/bookings${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<any>(`/bookings/${id}`),
    create: (data: any) => request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/bookings/${id}`, { method: 'DELETE' }),
  },
  fuel: {
    list: (vehicle_id?: number) => request<any[]>(`/fuel${vehicle_id ? `?vehicle_id=${vehicle_id}` : ''}`),
    summary: () => request<any[]>('/fuel/summary'),
    create: (data: any) => request<any>('/fuel', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/fuel/${id}`, { method: 'DELETE' }),
  },
  maintenance: {
    list: (vehicle_id?: number) => request<any[]>(`/maintenance${vehicle_id ? `?vehicle_id=${vehicle_id}` : ''}`),
    upcoming: () => request<any[]>('/maintenance/upcoming'),
    create: (data: any) => request<any>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/maintenance/${id}`, { method: 'DELETE' }),
  },
  invoices: {
    list: (status?: string) => request<any[]>(`/invoices${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<any>(`/invoices/${id}`),
    create: (data: any) => request<any>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/invoices/${id}`, { method: 'DELETE' }),
  },
  payments: {
    list: (params?: { party_type?: string; party_id?: number }) => {
      const q = new URLSearchParams();
      if (params?.party_type) q.set('party_type', params.party_type);
      if (params?.party_id) q.set('party_id', String(params.party_id));
      return request<any[]>(`/payments?${q}`);
    },
    create: (data: any) => request<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/payments/${id}`, { method: 'DELETE' }),
  },
  loadings: {
    list: () => request<any[]>('/loadings'),
    get: (id: number) => request<any>(`/loadings/${id}`),
    create: (data: any) => request<any>('/loadings', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/loadings/${id}`, { method: 'DELETE' }),
    search: (q: string) => request<any[]>(`/loadings/search?q=${encodeURIComponent(q)}`),
  },
  warehouses: {
    list: () => request<any[]>('/warehouses'),
    create: (data: any) => request<any>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/warehouses/${id}`, { method: 'DELETE' }),
  },
  deliveryPersons: {
    list: (status?: string) => request<any[]>(`/delivery-persons${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<any>(`/delivery-persons/${id}`),
    create: (data: any) => request<any>('/delivery-persons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/delivery-persons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/delivery-persons/${id}`, { method: 'DELETE' }),
  },
  receivings: {
    list: () => request<any[]>('/receivings'),
    get: (id: number) => request<any>(`/receivings/${id}`),
    loads: (vehicle_id: number) => request<any>(`/receivings/loads?vehicle_id=${vehicle_id}`),
    create: (data: any) => request<any>('/receivings', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/receivings/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    list: (params?: { category?: string; vehicle_id?: number }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.vehicle_id) q.set('vehicle_id', String(params.vehicle_id));
      return request<any[]>(`/expenses?${q}`);
    },
    categories: () => request<any[]>('/expenses/categories'),
    create: (data: any) => request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/expenses/${id}`, { method: 'DELETE' }),
  },
};
