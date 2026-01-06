
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

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white dark:bg-ink-950 w-full max-w-md rounded-[3rem] shadow-2xl border border-black/5 overflow-hidden">
        <div className="p-10 md:p-14">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-ink-900 dark:text-white">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-ink-400 mt-2">Identidad de Autor</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Nombre de Pluma</label>
                <input 
                  type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej. Gabriel García"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Contraseña</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isLogin ? 'Entrar al Studio' : 'Registrar Firma'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black uppercase tracking-widest text-ink-400 hover:text-amber-500 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
