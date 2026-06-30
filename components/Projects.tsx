
import React from 'react';
import { motion } from 'framer-motion';

const Projects: React.FC = () => {
  const projects = [
    {
      title: "Respaldo y Protección de Información de Usuarios",
      year: "2025",
      type: "Protección de Datos",
      desc: "Ejecución de copias de seguridad de archivos personales antes de mantenimiento, formateo o actualización de sistemas, asegurando la continuidad del trabajo del usuario.",
      features: [
        "Copias de seguridad preventivas",
        "Continuidad de flujo de trabajo",
        "Restauración post-mantenimiento"
      ],
      icon: "database"
    },
    {
      title: "Verificación de Funcionamiento y Rendimiento de Equipos",
      year: "2025",
      type: "Soporte Técnico",
      desc: "Comprobación básica de estabilidad, temperatura y rendimiento de laptops y PCs luego de mantenimiento, instalación de software o mejora de hardware, garantizando un uso normal para el usuario final.",
      features: [
        "Control de estabilidad térmica",
        "Validación de hardware nuevo",
        "Optimización de software base"
      ],
      icon: "settings_suggest"
    }
  ];

  return (
    <section id="proyectos" className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-primary-500 rounded-full"></span>
              <h3 className="text-primary-500 font-bold text-sm uppercase tracking-widest">Portafolio</h3>
            </div>
            <h2 className="text-4xl md:text-5xl font-black">PROYECTOS TÉCNICOS</h2>
            <p className="text-dark-text max-w-2xl text-lg">
              Soluciones enfocadas en la seguridad de la información y el rendimiento óptimo de los equipos de los usuarios.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((proj, idx) => (
              <motion.article 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative flex flex-col rounded-3xl border border-dark-border bg-dark-card p-8 md:p-10 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500">
                      <span className="material-symbols-outlined text-4xl">{proj.icon}</span>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-dark-bg border border-dark-border text-dark-text text-xs font-bold uppercase tracking-widest">
                      {proj.type}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 mb-8">
                    <span className="text-primary-500 font-black text-sm tracking-widest">{proj.year}</span>
                    <h3 className="text-3xl font-bold leading-tight group-hover:text-primary-500 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-dark-text leading-relaxed mt-2">
                      {proj.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-8 border-t border-dark-border/50">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-6 tracking-widest">Puntos Clave</h4>
                    <ul className="flex flex-col gap-4">
                      {proj.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3 text-dark-text group/item">
                          <span className="material-symbols-outlined text-primary-500 text-[20px] group-hover/item:scale-125 transition-transform">check_circle</span>
                          <span className="text-sm font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
