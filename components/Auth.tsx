
import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Icons } from './Icon';

interface AuthProps {
  supabase: SupabaseClient;
  onClose: () => void;
}

export const Auth: React.FC<AuthProps> = ({ supabase, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName }
          }
        });
        if (error) throw error;
        alert("¡Registro exitoso! Por favor, verifica tu email si es necesario.");
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Introduce tu email para recuperar la contraseña.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo de recuperación.");
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
                {resetSent ? 'Correo Enviado' : isLogin ? 'Bienvenido' : 'Crear Cuenta'}
              </h2>
              <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink-400 mt-2">Identidad de Autor</p>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-black/5 rounded-full transition-colors"><Icons.X size={20} /></button>
          </div>

          {resetSent ? (
            <div className="space-y-8 text-center py-6">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Icons.Check size={40} />
              </div>
              <p className="text-sm font-serif italic text-ink-500">
                Hemos enviado las instrucciones de recuperación a <span className="font-bold text-ink-900 dark:text-white">{email}</span>. Revisa tu bandeja de entrada.
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
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Nombre de Pluma</label>
                  <input 
                    type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Ej. Gabriel García"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Email Institucional</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="autor@storycraft.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Contraseña Maestra</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={handleResetPassword}
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
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-ink-300 hover:text-ink-600 dark:hover:text-white transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-500 text-[9px] font-bold uppercase text-center">{error}</p>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Procesando Archivos...' : isLogin ? 'Entrar al Studio' : 'Registrar Nueva Firma'}
              </button>
            </form>
          )}

          {!resetSent && (
            <div className="mt-10 text-center border-t border-black/5 pt-8">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-[9px] font-black uppercase tracking-widest text-ink-400 hover:text-amber-500 transition-colors"
              >
                {isLogin ? '¿Aún no eres miembro? Regístrate' : '¿Ya tienes firma registrada? Inicia sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
