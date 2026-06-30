import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AdminDashboardProps = {
  onClose: () => void;
};

type Ticket = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
};

type Cert = {
  id: number;
  title: string;
  icon: string;
  year: string;
  link: string;
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  likes: number;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'certs' | 'testimonials' | 'tickets'>('settings');

  // State para datos
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState({ cv_link: '', certifications_folder_link: '' });

  // Form states para edición
  const [editingCert, setEditingCert] = useState<Cert | null>(null);
  const [msgSuccess, setMsgSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Settings (público)
      const resSettings = await fetch('/api/settings');
      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettings(data);
      }

      // Certificaciones
      const resCerts = await fetch('/api/certifications');
      if (resCerts.ok) {
        const data = await resCerts.json();
        setCerts(data);
      }

      // Testimonios
      const resTest = await fetch('/api/testimonials');
      if (resTest.ok) {
        const data = await resTest.json();
        setTestimonials(data);
      }

      // Tickets (requiere token)
      const resTickets = await fetch('/api/contacts', { headers });
      if (resTickets.ok) {
        const data = await resTickets.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setMsgSuccess('Sesión iniciada con éxito.');
        setTimeout(() => setMsgSuccess(''), 2000);
      } else {
        setError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  // Guardar settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      const res1 = await fetch('/api/settings/cv_link', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value: settings.cv_link })
      });

      const res2 = await fetch('/api/settings/certifications_folder_link', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value: settings.certifications_folder_link })
      });

      if (res1.ok && res2.ok) {
        setMsgSuccess('Enlaces actualizados con éxito.');
        setTimeout(() => setMsgSuccess(''), 3000);
        fetchData();
      } else {
        setError('Error al actualizar las configuraciones.');
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
    }
  };

  // Editar certificación
  const handleUpdateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setMsgSuccess('');
    try {
      const response = await fetch(`/api/certifications/${editingCert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingCert.title,
          icon: editingCert.icon,
          year: editingCert.year,
          link: editingCert.link
        })
      });

      if (response.ok) {
        setMsgSuccess('Certificación actualizada con éxito.');
        setEditingCert(null);
        setTimeout(() => setMsgSuccess(''), 3000);
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar certificación.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    }
  };

  // Cambiar estado de ticket
  const handleChangeTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/contacts/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        setMsgSuccess('Ticket de soporte actualizado.');
        setTimeout(() => setMsgSuccess(''), 2000);
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-white font-sans">
      <div className="relative bg-dark-card border border-dark-border rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Cabecera común */}
        <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/60">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-500 text-3xl">admin_panel_settings</span>
            <h2 className="text-2xl font-black">Panel de Administración</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ALERTA DE ÉXITO O ERROR */}
        <AnimatePresence>
          {msgSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-green-500/25 border border-green-500 text-green-300 text-sm font-bold shadow-lg z-50"
            >
              {msgSuccess}
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-red-500/25 border border-red-500 text-red-300 text-sm font-bold shadow-lg z-50"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. MODO DE INICIO DE SESIÓN */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center bg-dark-bg/40">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleLogin}
              className="w-full max-w-md p-8 rounded-3xl bg-dark-card border border-dark-border shadow-xl flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold">Identificación Requerida</h3>
                <p className="text-dark-text text-sm mt-1">Ingresa tus credenciales administrativas</p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Usuario</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Ej. admin"
                    className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Contraseña</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl transition shadow-lg shadow-primary-500/20"
              >
                Acceder al Panel
              </button>
            </motion.form>
          </div>
        ) : (
          /* 2. MODO DASHBOARD REGISTRADO */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar de navegación */}
            <div className="w-64 border-r border-dark-border flex flex-col justify-between bg-dark-bg/20">
              <div className="p-4 flex flex-col gap-2">
                {[
                  { id: 'settings', label: 'Enlaces de Drive', icon: 'link' },
                  { id: 'certs', label: 'Certificaciones', icon: 'verified' },
                  { id: 'testimonials', label: 'Testimonios', icon: 'rate_review' },
                  { id: 'tickets', label: 'Tickets de Soporte', icon: 'contact_support' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setEditingCert(null); }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm text-left transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/10' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-dark-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 h-11 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold rounded-xl transition text-xs uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Contenedor de contenido de la pestaña */}
            <div className="flex-1 p-8 overflow-y-auto bg-dark-bg/10">
              
              {/* PESTAÑA 1: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-1">Ajustes Generales del Portafolio</h3>
                    <p className="text-dark-text text-sm">Configura los enlaces directos a Google Drive para tu CV y la carpeta de certificados.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Enlace de Descarga de CV</label>
                        <input 
                          type="url"
                          value={settings.cv_link}
                          onChange={(e) => setSettings(prev => ({ ...prev, cv_link: e.target.value }))}
                          required
                          className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Enlace de Carpeta de Certificados</label>
                        <input 
                          type="url"
                          value={settings.certifications_folder_link}
                          onChange={(e) => setSettings(prev => ({ ...prev, certifications_folder_link: e.target.value }))}
                          required
                          className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-fit px-8 h-12 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl transition shadow-lg shadow-primary-500/20"
                    >
                      Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {/* PESTAÑA 2: CERTIFICACIONES */}
              {activeTab === 'certs' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-1">Certificaciones Oficiales</h3>
                    <p className="text-dark-text text-sm">Administra las credenciales de Cisco Networking Academy mostradas en el sitio.</p>
                  </div>

                  {editingCert ? (
                    <form onSubmit={handleUpdateCert} className="max-w-xl p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-dark-border pb-4 mb-2">
                        <h4 className="font-bold">Editar Certificación: {editingCert.title}</h4>
                        <button type="button" onClick={() => setEditingCert(null)} className="text-slate-400 hover:text-white text-sm">Cancelar</button>
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Título de la Certificación</label>
                        <input 
                          type="text"
                          value={editingCert.title}
                          onChange={(e) => setEditingCert(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                          required
                          className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Icono (Material Symbol)</label>
                          <input 
                            type="text"
                            value={editingCert.icon}
                            onChange={(e) => setEditingCert(prev => prev ? ({ ...prev, icon: e.target.value }) : null)}
                            required
                            className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Año</label>
                          <input 
                            type="text"
                            value={editingCert.year}
                            onChange={(e) => setEditingCert(prev => prev ? ({ ...prev, year: e.target.value }) : null)}
                            required
                            className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Enlace de Credencial de Drive</label>
                        <input 
                          type="url"
                          value={editingCert.link}
                          onChange={(e) => setEditingCert(prev => prev ? ({ ...prev, link: e.target.value }) : null)}
                          required
                          className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full h-12 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl transition mt-2"
                      >
                        Actualizar Certificación
                      </button>
                    </form>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {certs.map(c => (
                        <div key={c.id} className="p-5 rounded-2xl bg-dark-card border border-dark-border flex justify-between items-center gap-4">
                          <div>
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{c.year}</span>
                            <h4 className="font-bold text-white leading-tight mt-1">{c.title}</h4>
                            <p className="text-xs text-slate-500 truncate max-w-sm mt-1">{c.link}</p>
                          </div>
                          <button
                            onClick={() => setEditingCert(c)}
                            className="h-10 px-4 rounded-xl border border-dark-border hover:border-primary-500 text-xs font-bold hover:bg-primary-500/10 transition-all flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Editar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: TESTIMONIOS */}
              {activeTab === 'testimonials' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-1">Opiniones y Testimonios</h3>
                    <p className="text-dark-text text-sm">Visualiza las opiniones registradas por tus clientes en el sitio.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {testimonials.map(t => (
                      <div key={t.id} className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{t.name}</h4>
                            <p className="text-xs text-slate-500">{t.role} • {t.rating} ⭐</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                            Visible
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed italic">"{t.text}"</p>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">thumb_up</span>
                          <span>{t.likes} me gusta</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA 4: TICKETS DE SOPORTE */}
              {activeTab === 'tickets' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-1">Tickets de Soporte Técnico</h3>
                    <p className="text-dark-text text-sm">Revisa las solicitudes de soporte técnico y el estado de la atención.</p>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-dark-border text-center text-slate-500">
                      No hay ningún ticket registrado en este momento.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {tickets.map(ticket => (
                        <div key={ticket.id} className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="font-bold text-white text-lg">{ticket.name}</h4>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                ticket.status === 'Resuelto' 
                                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                  : ticket.status === 'Diagnóstico'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }`}>
                                {ticket.status}
                              </span>
                              <span className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <p className="text-slate-300 text-sm leading-relaxed bg-dark-bg/40 p-4 rounded-xl border border-dark-border/40 mt-1 font-mono">
                              {ticket.message}
                            </p>

                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">mail</span>
                                {ticket.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">call</span>
                                {ticket.phone}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 min-w-[150px]">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cambiar Estado</label>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleChangeTicketStatus(ticket.id, e.target.value)}
                              className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500 text-white cursor-pointer"
                            >
                              <option value="En espera">🔴 En espera</option>
                              <option value="Diagnóstico">🟡 Diagnóstico</option>
                              <option value="Resuelto">🟢 Resuelto</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
