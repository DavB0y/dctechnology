
import React from 'react';

type FooterProps = {
  onAdminClick?: () => void;
};

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="py-12 bg-dark-bg border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-dark-text text-sm">
            © 2023 Davide Contreras Huerta. Todos los derechos reservados.
          </p>
          {onAdminClick && (
            <button
              onClick={onAdminClick}
              className="text-xs text-slate-500 hover:text-primary-500 flex items-center gap-1 transition-colors mt-2"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              Administración
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
