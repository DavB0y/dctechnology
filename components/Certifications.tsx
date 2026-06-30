
import React from 'react';
import { motion } from 'framer-motion';

type Cert = {
  id?: number;
  title: string;
  icon: string;
  year: string;
  link: string;
};

const defaultCerts: Cert[] = [
  { title: "IT Essentials 7.01", icon: "dvr", year: "2025", link: "https://drive.google.com/file/d/18-gl_RgVuCx2RYEFFhhP6HeIS3uAXSnF/view?usp=sharing" },
  { title: "Conceptos Básicos de Hardware", icon: "memory", year: "2025", link: "https://drive.google.com/file/d/19T4ouhesPyQnHj0PNnpAmLGaHO9Spe45/view?usp=sharing" },
  { title: "Conciencia digital", icon: "visibility", year: "2025", link: "https://drive.google.com/file/d/1i6I9xdnzw9ASyrviNQtjrbdJ_VX3fRsj/view?usp=sharing" },
  { title: "Introducción a la Ciberseguridad", icon: "shield_lock", year: "2025", link: "https://drive.google.com/file/d/1UKJ65frqiR8y8_d0gILqJ7NYH0pmVS1b/view?usp=drive_link" },
  { title: "Conceptos Básicos de Redes", icon: "router", year: "2025", link: "https://drive.google.com/file/d/1MY37JTXxkLN7iFsawlc4JGSY58RrUU0u/view?usp=drive_link" },
  { title: "Introducción a la IA Moderna", icon: "smart_toy", year: "2025", link: "https://drive.google.com/file/d/18CHjTUQzwSyR-Xn6sKbhNBrd6RxQO7X0/view?usp=drive_link" }
];

const Certifications: React.FC = () => {
  const [certs, setCerts] = React.useState<Cert[]>([]);

  React.useEffect(() => {
    const fetchCerts = async () => {
      try {
        const response = await fetch('/api/certifications');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCerts(data);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching certifications, using defaults:", err);
      }
      setCerts(defaultCerts);
    };

    fetchCerts();
  }, []);

  return (
    <section id="certificaciones" className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-4xl font-black">Certificaciones</h2>
            <p className="text-dark-text max-w-2xl">
              Validación profesional y técnica respaldada por <span className="text-white font-bold">Cisco Networking Academy</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary-500/50 hover:-translate-y-2 transition-all flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-3xl">{cert.icon}</span>
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{cert.year}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">{cert.title}</h3>
                  <p className="text-dark-text text-sm font-medium">Cisco Networking Academy</p>
                </div>
                <a 
                  href={cert.link} 
                  target={cert.link !== "#" ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-500 text-sm font-bold hover:underline w-fit"
                >
                  Ver credencial
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </motion.div>
            ))}

            <div className="p-8 rounded-2xl border border-dashed border-dark-border flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-4">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h3 className="text-lg font-bold">Próximamente</h3>
              <p className="text-dark-text text-sm">Más certificaciones en camino</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
