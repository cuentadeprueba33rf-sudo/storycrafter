
import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Icons } from './Icon';

interface AdminPanelProps {
  supabase: SupabaseClient;
  onBack: () => void;
}

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ supabase, onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Como el Auth API de Supabase no permite listar usuarios en el cliente,
      // usaremos los datos de la tabla de perfiles que sincroniza con Auth.
      // Si la tabla no existe, intentaremos obtener autores únicos del feed público.
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback: Obtener autores únicos de las historias publicadas
        const { data: stories } = await supabase
          .from('public_stories')
          .select('user_id, author_name, is_admin')
          .order('updated_at', { ascending: false });

        if (stories) {
          const uniqueUsers: UserProfile[] = [];
          const seenIds = new Set();
          
          stories.forEach((s: any) => {
            if (!seenIds.has(s.user_id)) {
              seenIds.add(s.user_id);
              uniqueUsers.push({
                id: s.user_id,
                display_name: s.author_name,
                email: "Oculto por seguridad",
                is_verified: s.is_admin || false,
                created_at: "Desconocida"
              });
            }
          });
          setUsers(uniqueUsers);
        }
      } else if (profiles) {
        setUsers(profiles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      // También actualizamos en el feed público para que el cambio sea visible
      await supabase
        .from('public_stories')
        .update({ is_admin: !currentStatus }) // Reutilizamos is_admin como flag de verificación
        .eq('user_id', userId);

      if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
        alert(`Estado de verificación actualizado para el autor.`);
      }
    } catch (e) {
      alert("Error al actualizar estado.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-ink-950 text-ink-100 font-sans selection:bg-amber-500/30">
      {/* Admin Header */}
      <header className="px-8 py-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
            <Icons.Back size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-black tracking-tighter italic">Censo de Autores</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] opacity-40">Protocolo de Moderación Activo</p>
            </div>
          </div>
        </div>

        <div className="relative w-80">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por firma o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:opacity-20"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Escaneando Base de Datos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between hover:bg-white/[0.04] transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-xl font-black shadow-2xl border border-white/10 ${user.is_verified ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-zinc-800'}`}>
                      {(user.display_name || "E")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-serif font-bold tracking-tight">{user.display_name}</h3>
                        {user.is_verified && <Icons.Check size={12} className="text-amber-500" strokeWidth={5} />}
                      </div>
                      <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest mt-1">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Registrado el</span>
                      <span className="text-[10px] font-mono">{user.created_at}</span>
                    </div>

                    <button 
                      onClick={() => toggleVerification(user.id, user.is_verified)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.is_verified ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-amber-500 text-black shadow-lg hover:scale-105 active:scale-95'}`}
                    >
                      {user.is_verified ? 'Revocar Sello' : 'Verificar Firma'}
                    </button>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-40 opacity-10">
                  {/* Fixed: Use Icons.Characters instead of Icons.Users as defined in components/Icon.tsx */}
                  <Icons.Characters size={48} className="mx-auto mb-4" />
                  <p className="text-xl font-serif italic">No se encontraron autores en esta frecuencia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="px-8 py-6 border-t border-white/5 bg-black/20 flex justify-between items-center opacity-40">
        <span className="text-[9px] font-black uppercase tracking-widest">Auth v1.0 Security Protocol</span>
        <span className="text-[9px] font-mono tracking-widest">{users.length} Usuarios Detectados</span>
      </footer>
    </div>
  );
};
