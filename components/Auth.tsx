
import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Icons } from './Icon';

interface AuthProps {
  supabase: SupabaseClient;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'SIGNUP' | 'RECOVERY';
}

export const Auth: React.FC<AuthProps> = ({ supabase, onClose, initialMode = 'LOGIN' }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'LOGIN') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else if (mode === 'SIGNUP') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName }
          }
        });
        if (error) throw error;
        alert("¡Registro exitoso! Por favor, verifica tu email si es necesario.");
        onClose();
      } else if (mode === 'RECOVERY') {
        // Actualizar contraseña del usuario que acaba de volver del link
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        alert("Tu contraseña ha sido actualizada con éxito. Ya puedes acceder.");
        setMode('LOGIN');
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!email) {
      setError("Introduce tu email para enviarte el enlace de recuperación.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Intentamos usar la URL actual como destino del redireccionamiento
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white dark:bg-ink-950 w-full max-w-md rounded-[3rem] shadow-2xl border border-black/5 overflow-hidden">
        <div className="p-8 md:p-14">
          <div className="flex justify-between items-center mb-10 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink-900 dark:text-white">
                {mode === 'RECOVERY' ? 'Nueva Contraseña' : resetSent ? 'Correo Enviado' : mode === 'LOGIN' ? 'Bienvenido' : 'Crear Cuenta'}
              </h2>
              <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink-400 mt-2">
                {mode === 'RECOVERY' ? 'Protocolo de Seguridad' : 'Identidad de Autor'}
              </p>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-black/5 rounded-full transition-colors"><Icons.X size={20} /></button>
          </div>

          {resetSent ? (
            <div className="space-y-8 text-center py-6">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Icons.Check size={40} />
              </div>
              <p className="text-sm font-serif italic text-ink-500 leading-relaxed">
                Hemos enviado las instrucciones a <span className="font-bold text-ink-900 dark:text-white">{email}</span>. <br/>
                <span className="text-[10px] block mt-4 text-amber-600 font-sans font-bold uppercase">Nota: Revisa tu carpeta de SPAM</span>
              </p>
              <button 
                onClick={() => setResetSent(false)}
                className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:underline"
              >
                Volver al acceso
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'SIGNUP' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Nombre de Pluma</label>
                  <input 
                    type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Ej. Gabriel García"
                  />
                </div>
              )}
              
              {mode !== 'RECOVERY' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Email Institucional</label>
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="autor@storycraft.com"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">
                    {mode === 'RECOVERY' ? 'Nueva Contraseña' : 'Contraseña Maestra'}
                  </label>
                  {mode === 'LOGIN' && (
                    <button 
                      type="button"
                      onClick={handleResetRequest}
                      className="text-[8px] font-black uppercase tracking-tighter text-amber-600 hover:text-amber-500 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder={mode === 'RECOVERY' ? "Mínimo 6 caracteres" : ""}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-ink-300 hover:text-ink-600 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-500 text-[9px] font-bold uppercase text-center leading-tight">{error}</p>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Sincronizando...' : mode === 'LOGIN' ? 'Entrar al Studio' : mode === 'SIGNUP' ? 'Registrar Firma' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}

          {!resetSent && mode !== 'RECOVERY' && (
            <div className="mt-10 text-center border-t border-black/5 pt-8">
              <button 
                onClick={() => {
                  setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                  setError(null);
                }}
                className="text-[9px] font-black uppercase tracking-widest text-ink-400 hover:text-amber-500 transition-colors"
              >
                {mode === 'LOGIN' ? '¿Aún no eres miembro? Regístrate' : '¿Ya tienes firma? Inicia sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
