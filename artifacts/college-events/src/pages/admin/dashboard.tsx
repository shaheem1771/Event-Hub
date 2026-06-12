import { Link } from "wouter";
import { useGetAdminDashboard } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Users, Ticket, Activity, 
  ArrowRight, PlusCircle, LayoutDashboard
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Active Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Ticket,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-full bg-muted/20 pb-16">
      <div className="border-b bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Overview of campus event activity</p>
          </div>
          <Link href="/admin/events/new">
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-4xl font-extrabold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/10 px-6 py-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Popular Events</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Events with the most registrations</p>
            </div>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className="gap-2 text-primary">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%] pl-6">Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.popularEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.popularEvents.map((event) => {
                    const fillPercentage = (event.registeredCount / event.capacity) * 100;
                    return (
                      <TableRow key={event.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6 py-4">
                          <div className="font-medium text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{event.category} • {event.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{format(new Date(event.date), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(event.date), "h:mm a")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium w-12">{event.registeredCount} / {event.capacity}</div>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${fillPercentage >= 100 ? 'bg-destructive' : fillPercentage > 80 ? 'bg-orange-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(fillPercentage, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant={event.spotsLeft === 0 ? "destructive" : "secondary"}>
                            {event.spotsLeft === 0 ? "Full" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
