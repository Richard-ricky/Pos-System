import { Outlet, Link, useLocation } from 'react-router';
import {
  Wallet, ShoppingCart, Receipt, CreditCard,
  Send, PlusCircle, LogOut, User, BarChart3, Package,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// ─── Nav link config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/wallet',       label: 'Wallet',          icon: Wallet,       roles: null },
  { to: '/pos',          label: 'POS',             icon: ShoppingCart, roles: null },
  { to: '/products',     label: 'Products',        icon: Package,      roles: null },
  { to: '/transactions', label: 'Transactions',    icon: Receipt,      roles: null },
  { to: '/accounts',     label: 'Linked Accounts', icon: CreditCard,   roles: null },
  { to: '/analytics',    label: 'Analytics',       icon: BarChart3,    roles: ['admin', 'manager'] },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function MainLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/wallet') return location.pathname === '/' || location.pathname === '/wallet';
    return location.pathname.startsWith(path);
  };

  const canAccess = (roles: readonly string[] | null) => {
    if (!roles) return true;
    return roles.includes(user?.role ?? '');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link to="/wallet" className="flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Wallet className="size-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-foreground">FinTech Wallet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Payments Made Simple</p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 hidden sm:flex">
              <Link to="/add-money">
                <PlusCircle className="size-3.5" />
                Add Money
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="gap-1.5 border-border hidden sm:flex">
              <Link to="/send-money">
                <Send className="size-3.5" />
                Send
              </Link>
            </Button>

            {/* Mobile: icon-only add/send */}
            <Button asChild size="icon" variant="ghost" className="sm:hidden">
              <Link to="/add-money"><PlusCircle className="size-4" /></Link>
            </Button>
            <Button asChild size="icon" variant="ghost" className="sm:hidden">
              <Link to="/send-money"><Send className="size-4" /></Link>
            </Button>

            <NotificationCenter />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 pl-1 pr-2">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-52">
                <DropdownMenuLabel className="text-muted-foreground font-normal text-xs truncate">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer gap-2"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Navigation ── */}
      <nav className="border-b border-border bg-background sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {NAV_LINKS.filter(({ roles }) => canAccess(roles)).map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    'flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150 shrink-0',
                    active
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  ].join(' ')}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}