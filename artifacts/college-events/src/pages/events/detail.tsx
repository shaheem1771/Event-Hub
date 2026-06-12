import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetEvent, 
  useRegisterForEvent, 
  useUnregisterFromEvent,
  getGetEventQueryKey,
  getListEventsQueryKey,
  getListMyRegistrationsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Calendar, MapPin, Users, User, ArrowLeft, 
  Clock, Share2, Ticket, CheckCircle2, AlertCircle
} from "lucide-react";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id || "";
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading, isError } = useGetEvent(eventId);
  
  const registerMut = useRegisterForEvent();
  const unregisterMut = useUnregisterFromEvent();

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register for events");
      return;
    }

    registerMut.mutate({ id: eventId }, {
      onSuccess: () => {
        toast.success("Successfully registered for event!");
        // Update local cache instead of full invalidate
        queryClient.setQueryData(getGetEventQueryKey(eventId), (old: any) => 
          old ? { ...old, isRegistered: true, spotsLeft: old.spotsLeft - 1, registeredCount: old.registeredCount + 1 } : old
        );
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMyRegistrationsQueryKey() });
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to register");
      }
    });
  };

  const handleUnregister = () => {
    unregisterMut.mutate({ id: eventId }, {
      onSuccess: () => {
        toast.success("Registration cancelled");
        queryClient.setQueryData(getGetEventQueryKey(eventId), (old: any) => 
          old ? { ...old, isRegistered: false, spotsLeft: old.spotsLeft + 1, registeredCount: old.registeredCount - 1 } : old
        );
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMyRegistrationsQueryKey() });
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to cancel registration");
      }
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="w-full aspect-[21/9] rounded-2xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full mt-8" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-8">This event might have been cancelled or removed.</p>
        <Link href="/">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const isFull = event.spotsLeft === 0;
  const isPast = new Date(event.date) < new Date();
  const eventDate = new Date(event.date);

  return (
    <div className="bg-background min-h-[calc(100dvh-4rem)] pb-24">
      {/* Hero Header with Image */}
      <div className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh] bg-muted overflow-hidden">
        {event.imageUrl ? (
          <>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-primary/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
      </div>

      <div className="container max-w-5xl mx-auto px-4 -mt-32 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full mb-6 border">
          <ArrowLeft className="w-4 h-4" />
          Back to all events
        </Link>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-sm py-1 px-3">
                  {event.category}
                </Badge>
                {event.isRegistered && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 text-sm py-1 px-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    You're going
                  </Badge>
                )}
                {isPast && (
                  <Badge variant="secondary" className="text-sm py-1 px-3">Past Event</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                {event.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{format(eventDate, "EEEE, MMMM d")}</h3>
                  <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4" />
                    {format(eventDate, "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Location</h3>
                  <p className="text-muted-foreground mt-0.5">{event.location}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Organizer</h3>
                  <p className="text-muted-foreground mt-0.5">{event.organizer}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Capacity</h3>
                  <p className="text-muted-foreground mt-0.5">
                    {event.registeredCount} / {event.capacity} registered
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Card (Sticky) */}
          <div className="md:sticky md:top-24 mt-8 md:mt-0">
            <div className="bg-card rounded-3xl border shadow-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">Registration</h3>
                {isPast ? (
                  <p className="text-muted-foreground">This event has already ended.</p>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold tracking-tight ${isFull && !event.isRegistered ? 'text-destructive' : 'text-primary'}`}>
                      {event.spotsLeft}
                    </span>
                    <span className="text-muted-foreground font-medium">spots left</span>
                  </div>
                )}
              </div>

              {!isPast && (
                <div className="space-y-3">
                  {!user ? (
                    <Link href="/login" className="w-full">
                      <Button className="w-full h-14 text-base font-semibold rounded-xl">
                        Sign in to Register
                      </Button>
                    </Link>
                  ) : user.role === 'admin' ? (
                    <div className="p-4 bg-muted rounded-xl text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Admins manage events from the dashboard
                      </p>
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button variant="outline" className="w-full mt-3">Edit Event</Button>
                      </Link>
                    </div>
                  ) : event.isRegistered ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                        <Ticket className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-primary">You're registered!</p>
                          <p className="text-xs text-primary/80">See you there</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full h-12" 
                        onClick={handleUnregister}
                        disabled={unregisterMut.isPending}
                      >
                        Cancel Registration
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                      onClick={handleRegister}
                      disabled={isFull || registerMut.isPending}
                    >
                      {isFull ? "Event Full" : "Register Now"}
                    </Button>
                  )}
                </div>
              )}

              <Separator className="my-6" />

              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share this event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
