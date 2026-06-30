
import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const cards = [
    {
      title: "Soporte técnico y optimización",
      desc: "Diagnóstico profundo y reparación de hardware/software para maximizar el rendimiento operativo y la vida útil de los equipos.",
      icon: "build"
    },
    {
      title: "Respaldo y recuperación de datos",
      desc: "Implementación de estrategias seguras de backup y protocolos de recuperación para proteger información crítica empresarial.",
      icon: "cloud_sync"
    },
    {
      title: "Consultoría tecnológica orientada a metas",
      desc: "Asesoramiento técnico estratégico alineado con objetivos de venta, facilitando la adopción de soluciones que impulsan el crecimiento.",
      icon: "trending_up"
    }
  ];

  return (
    <section id="sobre-mi" className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 max-w-3xl"
          >
            <div className="flex items-center gap-4 text-primary-500">
              <span className="h-px w-12 bg-primary-500"></span>
              <span className="text-sm font-bold uppercase tracking-widest">Perfil Profesional</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black">Sobre Mí</h2>
            <p className="text-dark-text text-xl leading-relaxed font-light">
              Estudiante de Ingeniería de Sistemas con sólida formación técnica respaldada por certificaciones Cisco en hardware, redes, ciberseguridad e IA moderna. Experiencia en soporte técnico, optimización de equipos, respaldos críticos y asesoría tecnológica orientada a resultados.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary-500/50 transition-all shadow-xl hover:shadow-primary-500/10"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{card.title}</h3>
                <p className="text-dark-text leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
