
import React from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  return (
    <section id="contacto" className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-16">
          {/* Cabecera de la sección */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-bold uppercase tracking-widest">
              Atención Inmediata
            </div>
            <h2 className="text-4xl md:text-5xl font-black">Canales de Atención Directa</h2>
            <p className="text-dark-text max-w-2xl text-lg leading-relaxed">
              ¿Tienes una emergencia técnica o un proyecto en mente? <br className="hidden md:block" /> Elige el canal que prefieras para recibir soporte especializado.
            </p>
          </div>

          {/* Grid de 2 Columnas Principales */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Columna 1: Canales Directos */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-dark-card border border-dark-border shadow-2xl flex flex-col gap-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">contact_support</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Vías de Comunicación</h3>
              </div>

              <div className="grid gap-4">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/51926533855" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 p-6 rounded-2xl bg-green-500/5 hover:bg-green-500/10 transition-all border border-green-500/10 hover:border-green-500/40"
                >
                  <div className="w-14 h-14 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">chat</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-white text-lg font-bold">Chat Directo</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-white transition-colors">arrow_forward</span>
                </a>

                {/* Email */}
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=davidecontrerashuerta10@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 p-6 rounded-2xl bg-primary-500/5 hover:bg-primary-500/10 transition-all border border-primary-500/10 hover:border-primary-500/40"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-primary-500 uppercase tracking-widest mb-1">Correo Electrónico</p>
                    <p className="text-white text-sm sm:text-base md:text-lg font-bold break-all">davidecontrerashuerta10@gmail.com</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-white transition-colors">arrow_forward</span>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/davide-contreras-81620138b/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 p-6 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-all border border-blue-500/10 hover:border-blue-500/40"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Red Profesional</p>
                    <p className="text-white text-lg font-bold">LinkedIn Profile</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-white transition-colors">arrow_forward</span>
                </a>
              </div>
            </motion.div>

            {/* Columna 2: Seguridad Garantizada & Soporte */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white relative overflow-hidden group h-full flex flex-col justify-between shadow-2xl">
                {/* Decoración de Fondo */}
                <span className="material-symbols-outlined absolute -bottom-16 -right-16 text-[250px] text-white/10 group-hover:scale-110 transition-transform duration-1000 select-none">security</span>
                
                <div className="relative z-10">
                  <h4 className="text-4xl font-black mb-6 leading-tight">Seguridad & Confidencialidad <br /> Garantizada</h4>
                  
                  <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
                    Como experto en soporte técnico, entiendo el valor de tu información. Todos los servicios de backup, migración y reparación se realizan bajo estrictos protocolos de privacidad.
                  </p>

                  <ul className="space-y-4">
                    {[
                      { icon: 'lock', text: 'Manejo encriptado de datos críticos' },
                      { icon: 'verified_user', text: 'Respaldo certificado bajo normas Cisco' },
                      { icon: 'history', text: 'Tiempos de respuesta menores a 24h' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400">{item.icon}</span>
                        <span className="text-sm font-medium text-white/90">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Disponibilidad</span>
                    <span className="text-white font-bold">Lunes a Sábado</span>
                  </div>
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-500 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
