
import React from 'react';
import { motion } from 'framer-motion';

const Experience: React.FC = () => {
  const items = [
    {
      role: "Técnico de Soporte TI",
      company: "Independiente",
      period: "Mar 2023 – Presente",
      desc: [
        "Diagnóstico y repotenciación: Evaluación integral de hardware y software para optimizar el rendimiento de equipos de cómputo.",
        "Respaldos híbridos: Implementación estratégica de copias de seguridad tanto locales como en la nube para garantizar la integridad de los datos.",
        "Asesoría de compra: Consultoría técnica especializada para asegurar la compatibilidad y costo-efectividad en la adquisición de componentes."
      ],
      tags: ["Soporte Técnico", "Backups", "Consultoría", "Hardware"],
      current: true
    },
    {
      role: "Atención al Cliente & Logística",
      company: "HouseTech – Tienda de Accesorios Tecnológicos",
      period: "Feb 2022 – Oct 2022",
      desc: [
        "Logística y control de stock: Gestión y control de inventario asegurando disponibilidad continua de productos.",
        "Atención al cliente: Atención al cliente orientada a la experiencia del usuario y cumplimiento de objetivos de venta.",
        "Resolución técnica: Soporte técnico de primer nivel en consultas sobre accesorios y compatibilidad de dispositivos."
      ],
      tags: ["Ventas", "Logística", "Atención al Cliente"],
      current: false
    }
  ];

  return (
    <section id="experiencia" className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <div className="pl-4 border-l-4 border-primary-500">
            <h2 className="text-4xl font-black mb-2">Experiencia Profesional</h2>
            <p className="text-dark-text max-w-2xl">
              Trayectoria enfocada en soluciones eficientes, ventas consultivas y atención al cliente de alto nivel.
            </p>
          </div>

          <div className="relative pl-8 space-y-12 before:absolute before:left-[17px] before:top-2 before:bottom-0 before:w-[2px] before:bg-dark-border">
            {items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-4 border-dark-bg flex items-center justify-center transition-colors z-10 ${
                  item.current ? 'bg-primary-500 shadow-lg shadow-primary-500/40' : 'bg-dark-border text-dark-text'
                }`}>
                  <span className="material-symbols-outlined text-[16px] text-white">
                    {item.current ? 'engineering' : 'history'}
                  </span>
                </div>

                <div className="p-8 rounded-2xl bg-dark-card border border-dark-border group-hover:border-primary-500/30 transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{item.role}</h3>
                      <p className="text-primary-500 font-bold text-lg">{item.company}</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-dark-bg border border-dark-border text-sm font-semibold text-dark-text flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      {item.period}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {item.desc.map((bullet, bIdx) => {
                      const [title, text] = bullet.split(': ');
                      return (
                        <li key={bIdx} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary-500 mt-0.5">check_circle</span>
                          <p className="text-dark-text leading-relaxed">
                            <strong className="text-white">{title}:</strong> {text}
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-6 border-t border-dark-border/50">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-md bg-dark-bg text-xs font-bold text-dark-text uppercase tracking-wider border border-dark-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
