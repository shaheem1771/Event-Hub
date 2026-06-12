import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LogOut, Calendar, PlusCircle, LayoutDashboard, Compass, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary transition-colors hover:text-primary/80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Calendar className="w-5 h-5" />
            </div>
            LBSCEK Event Hub
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                  {user.role === 'admin' ? (
                    <>
                      <Link href="/admin" className={`transition-colors hover:text-primary ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Dashboard
                      </Link>
                      <Link href="/admin/events" className={`transition-colors hover:text-primary ${location === '/admin/events' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Manage Events
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Discover
                      </Link>
                      <Link href="/my-events" className={`transition-colors hover:text-primary ${location === '/my-events' ? 'text-primary' : 'text-muted-foreground'}`}>
                        My Tickets
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 pl-6 border-l">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-sm">
                      <p className="font-semibold leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-all">
                    Join Hub
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-md pb-safe">
          <div className="flex items-center justify-around h-16 px-4">
            {user.role === 'admin' ? (
              <>
                <Link href="/admin" className={`flex flex-col items-center gap-1 ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Dash</span>
                </Link>
                <Link href="/admin/events/new" className="flex flex-col items-center gap-1 -mt-5">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                </Link>
                <Link href="/admin/events" className={`flex flex-col items-center gap-1 ${location === '/admin/events' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Calendar className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Events</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className={`flex flex-col items-center gap-1 ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Compass className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Discover</span>
                </Link>
                <Link href="/my-events" className={`flex flex-col items-center gap-1 ${location === '/my-events' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Ticket className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Tickets</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
