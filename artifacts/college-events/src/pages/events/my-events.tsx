import { Link } from "wouter";
import { useListMyRegistrations } from "@workspace/api-client-react";
import { EventCard } from "@/components/event-card";
import { Ticket, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MyEvents() {
  const { data: events, isLoading } = useListMyRegistrations();

  return (
    <div className="min-h-full bg-background pb-16">
      <div className="bg-muted/30 border-b">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
              <p className="text-muted-foreground mt-1">Events you are registered for</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4 rounded-xl border p-4">
                <Skeleton className="w-full aspect-[16/9] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <CalendarClock className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No upcoming events</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't registered for any events yet. Check out what's happening on campus and grab a spot!
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full px-8 font-semibold">
                Browse Events
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={{...event, isRegistered: true}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
