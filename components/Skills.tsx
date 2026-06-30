
import React from 'react';
import { motion } from 'framer-motion';

const Skills: React.FC = () => {
  const skillCategories = [
    {
      title: "Hardware",
      icon: "memory",
      skills: ["Mantenimiento de laptops y torres", "Instalación de RAM y SSD", "Diagnóstico de periféricos", "Ensamblaje de estaciones de trabajo"]
    },
    {
      title: "Soporte de Datos",
      icon: "database",
      skills: ["Backup y recuperación", "Almacenamiento en la nube", "Migración de perfiles", "Integridad de la información"]
    },
    {
      title: "Diagnóstico",
      icon: "troubleshoot",
      skills: ["CrystalDisk Info/Mark", "Cinebench R23", "CPU-Z / GPU-Z", "Interpretación de métricas de rendimiento"]
    },
    {
      title: "Sistemas y Conectividad",
      icon: "router",
      skills: ["Configuración de Windows y Linux", "Gestión de BIOS/UEFI", "Redes domésticas y SOHO", "Resolución de incidencias de conectividad"]
    }
  ];

  const softSkills = [
    "Orientación al logro de metas comerciales",
    "Comunicación asertiva y persuasiva",
    "Aprendizaje continuo"
  ];

  return (
    <section id="conocimientos" className="py-24 bg-dark-bg/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-black">Conocimientos Técnicos</h2>
            <p className="text-dark-text max-w-2xl">
              Especialización en soporte técnico integral, gestión de infraestructuras y diagnóstico avanzado de sistemas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {skillCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-dark-card border border-dark-border"
              >
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-dark-border">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/20 text-primary-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold">{cat.title}</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cat.skills.map((skill, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary-500 text-sm mt-1">check_circle</span>
                      <span className="text-dark-text text-sm font-medium leading-tight">{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-primary-500/5 border border-primary-500/20">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-500">psychology</span>
              Habilidades Blandas
            </h3>
            <div className="flex flex-wrap gap-4">
              {softSkills.map((skill, idx) => (
                <div key={idx} className="px-6 py-3 rounded-xl bg-dark-card border border-dark-border text-white font-medium flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
