'use client';

import { useState } from 'react';
import countriesData from '@/data/countries.json';

// Colores del theme (definidos en global.css)
const colors = {
  primary: 'oklch(0.66 0.18 148)',
  secondary: 'oklch(0.62 0.22 20)',
  primaryForeground: '#ffffff',
  muted: 'oklch(0.92 0.02 240)',
  border: 'oklch(0.9 0.01 240)',
  foreground: 'oklch(0.16 0.06 150)',
};

// Países con códigos telefónicos
const paises = [
  ...countriesData.map((c: any) => ({ nombre: c.nameES, codigo: c.phoneCode })).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)),
  { nombre: 'Otro', codigo: '' }
];

const idiomas = ['Español', 'English', 'Português', 'Français', 'Deutsch', 'Italiano'];
const categoriasHotel = ['2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas', 'No específico'];

export default function PlaneaTuViaje() {
  const [formData, setFormData] = useState({
    nombres: '',
    pais: '',
    email: '',
    adultos: '1',
    menores: '0',
    fechaViaje: '',
    idioma: 'Español',
    categoriaHotel: 'No específico',
    mensaje: ''
  });

  const [codigoPais, setCodigoPais] = useState('51');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Obtener código de país al seleccionar país
  const handlePaisChange = (paisNombre: string) => {
    const pais = paises.find(p => p.nombre === paisNombre);
    if (pais) {
      setCodigoPais(pais.codigo || '');
    }
    setFormData(prev => ({ ...prev, pais: paisNombre }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/planea-tu-viaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, codigoPais })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({
          nombres: '',
          pais: '',
          email: '',
          adultos: '1',
          menores: '0',
          fechaViaje: '',
          idioma: 'Español',
          categoriaHotel: 'No específico',
          mensaje: ''
        });
        setCodigoPais('51');
        alert('¡Gracias por contactarnos! Te responderemos en breve.');
      } else {
        throw new Error(result.error || 'Error en el envío');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      alert('Hubo un error al enviar tu solicitud. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    borderColor: colors.border,
    color: colors.foreground,
    backgroundColor: 'rgba(255,255,255,0.88)',
  };

  const buttonStyle = () => {
    if (submitStatus === 'success') {
      return { background: 'linear-gradient(to right, #22c55e, #16a34a)', color: '#fff' };
    }
    if (submitStatus === 'error') {
      return { background: 'linear-gradient(to right, #ef4444, #dc2626)', color: '#fff' };
    }
    return {
      background: `linear-gradient(to right, ${colors.primary}, oklch(0.6 0.15 148))`,
      color: colors.primaryForeground
    };
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-sm border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,248,246,0.98))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8"
    >
      <div className="flex items-center gap-3 pb-5">
        <div className="h-[2px] w-12 rounded-full bg-primary/70" />
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      {/* INFORMACION PERSONAL */}
      <section className="rounded-sm bg-white/80 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] md:p-6">
        <div className="mb-5 flex items-end justify-between gap-4 pb-4">
          <div>
            <span className="mb-2 inline-flex text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              01
            </span>
            <h3 className="text-lg font-semibold" style={{ color: colors.foreground }}>
              INFORMACIÓN PERSONAL
            </h3>
          </div>
          <div className="hidden h-px flex-1 bg-stone-100 md:block" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              País <span className="text-red-500">*</span>
            </label>
            <select
              name="pais"
              value={formData.pais}
              onChange={(e) => handlePaisChange(e.target.value)}
              required
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">Selecciona tu país</option>
              {paises.map(pais => (
                <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              WhatsApp
            </label>
            <div className="flex overflow-hidden rounded-sm shadow-sm">
              <span
                className="flex items-center border border-r-0 px-4 py-3 text-sm font-medium"
                style={{ borderColor: colors.border, backgroundColor: colors.muted, color: colors.foreground }}
              >
                +{codigoPais || '51'}
              </span>
              <input
                type="tel"
                name="telefono"
                style={{ ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                className="w-full rounded-r-sm border px-4 py-3 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="999 999 999"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DETALLES DEL VIAJE */}
      <section className="rounded-sm bg-white/80 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] md:p-6">
        <div className="mb-5 flex items-end justify-between gap-4 pb-4">
          <div>
            <span className="mb-2 inline-flex text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              02
            </span>
            <h3 className="text-lg font-semibold" style={{ color: colors.foreground }}>
              DETALLES DEL VIAJE
            </h3>
          </div>
          <div className="hidden h-px flex-1 bg-stone-100 md:block" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              N° Adultos
            </label>
            <input
              type="number"
              name="adultos"
              value={formData.adultos}
              onChange={handleChange}
              min="1"
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              N° Menores
            </label>
            <input
              type="number"
              name="menores"
              value={formData.menores}
              onChange={handleChange}
              min="0"
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              Fecha de Viaje
            </label>
            <input
              type="date"
              name="fechaViaje"
              value={formData.fechaViaje}
              onChange={handleChange}
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              Idioma del Guiado
            </label>
            <select
              name="idioma"
              value={formData.idioma}
              onChange={handleChange}
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {idiomas.map(idioma => (
                <option key={idioma} value={idioma}>{idioma}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
              Categoría de Hotel
            </label>
            <select
              name="categoriaHotel"
              value={formData.categoriaHotel}
              onChange={handleChange}
              style={inputStyle}
              className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {categoriasHotel.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensaje */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium" style={{ color: colors.foreground }}>
            Cuéntanos más sobre tu viaje soñado
          </label>
          <textarea
            name="men"
            value={formData.mensaje}
            onChange={handleChange}
            rows={4}
            style={inputStyle}
            className="w-full rounded-sm border px-4 py-3 text-sm shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Lugares que no quieres perder, detalles adicionales, tours que te interesan, etc."
          ></textarea>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          style={buttonStyle()}
          className="w-full rounded-sm px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all shadow-[0_18px_36px_rgba(15,23,42,0.14)] hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(15,23,42,0.18)] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSubmitting ? '⏳ Enviando...' : submitStatus === 'success' ? '✅ Enviado' : submitStatus === 'error' ? '❌ Error' : 'Solicitar Cotización'}
        </button>
      </div>
    </form>
  );
}
