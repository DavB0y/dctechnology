import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy tu asistente virtual. ¿Tienes alguna consulta?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Excluir el primer mensaje de bienvenida del historial enviado a la API para no confundir al modelo
      const historyToSend = messages.slice(1);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: historyToSend,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
      } else {
        const errorData = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: `Ocurrió un inconveniente: ${errorData.error || 'No se pudo conectar con el asistente.'}` }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Lo siento, no pude comunicarme con el servidor. Por favor verifica tu conexión.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {/* Ventana de Chat */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[360px] sm:w-[400px] h-[500px] bg-dark-card/95 border border-dark-border rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl mb-4"
          >
            {/* Cabecera del Chat */}
            <div className="p-5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-2xl">smart_toy</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary-500 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wide">Asistente Técnico</h4>
                  <p className="text-[10px] text-white/80">Soporte Inteligente</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-dark-bg/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : 'bg-dark-card border border-dark-border text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-dark-card border border-dark-border p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSend} className="p-4 border-t border-dark-border bg-dark-card flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                disabled={isLoading}
                className="flex-1 bg-dark-bg/60 border border-dark-border focus:border-primary-500/70 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-11 h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary-500/15"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl relative group hover:shadow-primary-500/25 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-2xl"
            >
              close
            </motion.span>
          ) : (
            <motion.span
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-2xl"
            >
              smart_toy
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Tooltip */}
        {!isOpen && (
          <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-dark-card border border-dark-border text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            ¿Necesitas soporte técnico? Pregúntame
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
