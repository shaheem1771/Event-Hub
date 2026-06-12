import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListAdminEvents, 
  useDeleteEvent,
  getListAdminEventsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  MoreHorizontal, Calendar, PlusCircle, 
  Edit, Trash2, Users, Search, ExternalLink 
} from "lucide-react";

export default function AdminEventsList() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useListAdminEvents();
  const deleteEvent = useDeleteEvent();

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteEvent.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast.success("Event deleted successfully");
        queryClient.invalidateQueries({ queryKey: getListAdminEventsQueryKey() });
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to delete event");
        setDeleteId(null);
      }
    });
  };

  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase()) || 
    event.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-background pb-16">
      <div className="border-b bg-muted/20">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
              </div>
              <p className="text-muted-foreground">View, edit, and manage all campus events</p>
            </div>
            <Link href="/admin/events/new">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                New Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[30%] pl-6">Event Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : filteredEvents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No events found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents?.map((event) => {
                  const isPast = new Date(event.date) < new Date();
                  const isFull = event.spotsLeft === 0;

                  return (
                    <TableRow key={event.id} className="group">
                      <TableCell className="pl-6 py-4">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{event.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{event.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{format(new Date(event.date), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{format(new Date(event.date), "h:mm a")}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="line-clamp-1 max-w-[200px]">{event.location}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{event.registeredCount}</span>
                          <span className="text-xs text-muted-foreground">/ {event.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isPast ? "outline" : isFull ? "destructive" : "default"} className={!isPast && !isFull ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-transparent shadow-none" : ""}>
                          {isPast ? "Past" : isFull ? "Full" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Link href={`/events/${event.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                                View Public Page
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/events/${event.id}/participants`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                View Participants
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Event
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setDeleteId(event.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove all registrations associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
