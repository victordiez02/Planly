import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/features/auth/store';

function HeaderLogo() {
  return (
    <Link to="/" className="group">
      <Logo className="transition-transform duration-300 group-hover:-rotate-2" />
    </Link>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <HeaderLogo />
            <nav className="hidden gap-1 sm:flex">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-foreground/5 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                Inicio
              </NavLink>
              {user && (
                <NavLink
                  to={`/u/${user.id}`}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-foreground/5 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  Mi perfil
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && (
              <>
                <button
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-foreground/5"
                  onClick={() => nav(`/u/${user.id}`)}
                >
                  <Avatar name={user.name} src={user.avatar_url} size={28} />
                  <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                </button>
                <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container relative flex-1 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Planly · Pequeños sorteos para grandes recuerdos
          <span className="h-1 w-1 rounded-full bg-secondary" />
        </span>
      </footer>
    </div>
  );
}
