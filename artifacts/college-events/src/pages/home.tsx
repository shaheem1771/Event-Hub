import { useState } from "react";
import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Compass, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  
  const { data: events, isLoading } = useListEvents({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    upcoming: "true"
  });

  const categories = [
    "Academic", "Social", "Sports", "Career", "Workshop", "Other"
  ];

  return (
    <div className="min-h-full pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-24 border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-accent/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Your LBSCEK Life, Amplified
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
            Discover What's <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Happening Next</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Find the best events at LBSCEK, connect with peers, and make the most of your college experience.
          </p>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto bg-card p-2 rounded-2xl md:rounded-full shadow-lg border border-border/50">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text"
                placeholder="Search events by name, location..." 
                className="w-full pl-12 h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px] shrink-0 border-t sm:border-t-0 sm:border-l border-border/50 sm:pl-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-12 border-none shadow-none focus:ring-0 bg-transparent text-base font-medium">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-4 rounded-xl border p-4">
                <Skeleton className="w-full aspect-[16/9] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any upcoming events matching your search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
