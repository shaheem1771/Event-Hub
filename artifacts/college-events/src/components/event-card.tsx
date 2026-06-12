import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isFull = event.spotsLeft === 0;
  
  return (
    <Card className="group overflow-hidden flex flex-col h-full border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-card">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-105 transition-transform duration-500 ease-out">
            <Calendar className="w-12 h-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background border-none shadow-sm font-medium">
            {event.category}
          </Badge>
          {event.isRegistered && (
            <Badge className="bg-primary hover:bg-primary shadow-sm font-medium">
              Registered
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="p-5 pb-0 flex-none">
        <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-5 pt-4 flex-1">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="font-medium text-foreground/80">{format(new Date(event.date), "PPP 'at' p")}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary/70 shrink-0" />
            <span className={isFull ? "text-destructive font-medium" : ""}>
              {isFull ? "Event Full" : `${event.spotsLeft} spots left`}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm line-clamp-2 text-muted-foreground/80">
          {event.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 mt-auto">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant={event.isRegistered ? "secondary" : "default"} className="w-full group/btn relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-2 font-semibold">
              {event.isRegistered ? "View Ticket" : "View Details"}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
