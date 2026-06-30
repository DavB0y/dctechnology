import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Review = {
  id?: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  likes: number;
};


const Testimonials: React.FC = () => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [startIndex, setStartIndex] = React.useState(0);
  const [likedKeys, setLikedKeys] = React.useState<string[]>([]);

  // Estados para formulario de testimonio
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newRole, setNewRole] = React.useState('');
  const [newText, setNewText] = React.useState('');
  const [newRating, setNewRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [formSuccess, setFormSuccess] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const itemsPerPage = 3;

  React.useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Error al cargar testimonios:", err);
      }
    };

    fetchTestimonials();

    if (typeof window !== "undefined") {
      const keys = JSON.parse(localStorage.getItem("liked_keys") || "[]");
      setLikedKeys(keys);
    }
  }, []);

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newText) {
      setFormError('Por favor completa todos los campos.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          text: newText,
          rating: newRating,
        }),
      });

      if (response.ok) {
        setFormSuccess('¡Gracias! Tu testimonio ha sido enviado y registrado con éxito.');
        setNewName('');
        setNewRole('');
        setNewText('');
        setNewRating(5);
        
        // Recargar la lista de testimonios
        const resList = await fetch('/api/testimonials');
        if (resList.ok) {
          const data = await resList.json();
          if (data && data.length > 0) {
            setReviews(data);
          }
        }
        
        setTimeout(() => {
          setIsFormOpen(false);
          setFormSuccess('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al enviar el testimonio.');
      }
    } catch (err) {
      setFormError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextReviews = () => {
    setStartIndex((prev) =>
      prev + itemsPerPage >= reviews.length ? 0 : prev + itemsPerPage
    );
  };

  const prevReviews = () => {
    setStartIndex((prev) => {
      if (prev === 0) {
        return Math.floor((reviews.length - 1) / itemsPerPage) * itemsPerPage;
      }
      return prev - itemsPerPage;
    });
  };

  const visibleReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  const handleLike = async (reviewId: number | undefined, reviewName: string) => {
    if (typeof window === "undefined") return;

    // Usar id cuando existe, si no usar nombre como clave única anti-spam
    const likeKey = reviewId !== undefined ? `id_${reviewId}` : `name_${reviewName}`;

    if (likedKeys.includes(likeKey)) return;

    const newLiked = [...likedKeys, likeKey];

    if (reviewId !== undefined) {
      try {
        const response = await fetch(`/api/testimonials/${reviewId}/like`, {
          method: 'POST',
        });
        if (response.ok) {
          const updated = reviews.map((review) =>
            review.id === reviewId
              ? { ...review, likes: review.likes + 1 }
              : review
          );
          setReviews(updated);
          localStorage.setItem("liked_keys", JSON.stringify(newLiked));
          setLikedKeys(newLiked);
        }
      } catch (err) {
        console.error("Error sending like:", err);
      }
    } else {
      // Fallback local (cuando no hay id — reviews del defaultReviews)
      const updated = reviews.map((review) =>
        review.name === reviewName
          ? { ...review, likes: review.likes + 1 }
          : review
      );
      setReviews(updated);
      localStorage.setItem("liked_keys", JSON.stringify(newLiked));
      setLikedKeys(newLiked);
    }
  };


  return (
    <section id="testimonios" className="py-24 bg-dark-bg/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-4xl font-black">Lo que dicen mis clientes</h2>
            <p className="text-dark-text max-w-2xl text-lg">
              Compromiso con la calidad y soluciones técnicas efectivas.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={prevReviews}
              className="hidden md:flex absolute left-[-50px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white hover:border-primary-500 hover:text-primary-500 transition"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <button
              onClick={nextReviews}
              className="hidden md:flex absolute right-[-50px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white hover:border-primary-500 hover:text-primary-500 transition"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={startIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-3 gap-8"
              >
                {visibleReviews.map((rev, idx) => (
                  <motion.div
                    key={`${rev.name}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative p-8 rounded-3xl bg-dark-card border border-dark-border flex flex-col gap-6 group overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-lg border border-primary-500/30">
                        {rev.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{rev.name}</h4>
                        <p className="text-dark-text text-sm">{rev.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 text-primary-500">
                      {[...Array(5)].map((_, i) => {
                        const isFull = i < Math.floor(rev.rating);
                        const isHalf =
                          i === Math.floor(rev.rating) && rev.rating % 1 !== 0;

                        return (
                          <span
                            key={i}
                            className={`material-symbols-outlined text-[20px] ${
                              isFull || isHalf ? "filled-icon" : ""
                            }`}
                          >
                            {isHalf ? "star_half" : "star"}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-dark-text leading-relaxed italic relative z-10 flex-1">
                      "{rev.text}"
                    </p>

                    <div className="pt-6 border-t border-dark-border flex justify-between items-center relative z-10">
                      {(() => {
                        const isLiked = likedKeys.includes(rev.id !== undefined ? `id_${rev.id}` : `name_${rev.name}`);
                        return (
                          <div
                            className={`flex items-center gap-2 cursor-pointer transition-colors ${
                              isLiked ? "text-primary-500 hover:text-primary-600" : "text-dark-text hover:text-white"
                            }`}
                            onClick={() => handleLike(rev.id, rev.name)}
                          >
                            <span className={`material-symbols-outlined text-lg ${isLiked ? "filled-icon" : ""}`}>
                              thumb_up
                            </span>
                            <span className="text-xs font-bold">{rev.likes}</span>
                          </div>
                        );
                      })()}

                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Verificado
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-6 md:hidden">
              <button
                onClick={prevReviews}
                className="w-11 h-11 rounded-full border border-dark-border bg-dark-card text-white hover:border-primary-500 hover:text-primary-500 transition"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                onClick={nextReviews}
                className="w-11 h-11 rounded-full border border-dark-border bg-dark-card text-white hover:border-primary-500 hover:text-primary-500 transition"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Formulario para agregar testimonio */}
            <div className="flex flex-col items-center mt-12 gap-6">
              {!isFormOpen ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:border-primary-500 text-primary-500 hover:text-white font-bold transition-all shadow-md"
                >
                  <span className="material-symbols-outlined">rate_review</span>
                  Dejar una opinión
                </button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmitTestimonial}
                  className="w-full max-w-xl p-8 rounded-3xl bg-dark-card border border-dark-border shadow-xl flex flex-col gap-5 relative text-left"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-dark-border">
                    <h4 className="font-bold text-white text-lg">Escribe tu opinión</h4>
                    <button
                      type="button"
                      onClick={() => { setIsFormOpen(false); setFormError(''); setFormSuccess(''); }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  {formSuccess && (
                    <div className="p-4 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-sm font-semibold">
                      {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 text-sm font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                        className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Ocupación / Rol</label>
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Ej. Estudiante, Abogado"
                        required
                        className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Calificación (Estrellas)</label>
                    <div className="flex gap-1 text-primary-500" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const displayRating = hoverRating > 0 ? hoverRating : newRating;
                        const isFull = star <= Math.floor(displayRating);
                        const isHalf = star === Math.ceil(displayRating) && displayRating % 1 !== 0;

                        return (
                          <div key={star} className="relative cursor-pointer" style={{ width: '36px', height: '36px' }}>
                            {/* Media izquierda */}
                            <div
                              className="absolute inset-y-0 left-0 w-1/2 z-10"
                              onMouseEnter={() => setHoverRating(star - 0.5)}
                              onClick={() => setNewRating(star - 0.5)}
                            />
                            {/* Media derecha */}
                            <div
                              className="absolute inset-y-0 right-0 w-1/2 z-10"
                              onMouseEnter={() => setHoverRating(star)}
                              onClick={() => setNewRating(star)}
                            />
                            {/* Icono */}
                            <span
                              className={`material-symbols-outlined text-[36px] leading-none select-none pointer-events-none ${
                                isFull ? 'filled-icon' : isHalf ? 'filled-icon' : ''
                              }`}
                              style={isHalf ? { fontVariationSettings: "'FILL' 1", clipPath: 'inset(0 50% 0 0)', WebkitClipPath: 'inset(0 50% 0 0)' } : {}}
                            >
                              {isHalf ? 'star_half' : 'star'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tu Opinión</label>
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Cuéntanos cómo fue tu experiencia con el soporte técnico..."
                      required
                      rows={4}
                      className="w-full bg-dark-bg border border-dark-border focus:border-primary-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 font-bold rounded-xl transition shadow-lg shadow-primary-500/15 text-white"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
