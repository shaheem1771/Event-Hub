import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { useGetEventParticipants, useGetEvent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users, Download, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminEventParticipants() {
  const [, params] = useRoute("/admin/events/:id/participants");
  const eventId = params?.id || "";

  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: participants, isLoading: isLoadingParticipants } = useGetEventParticipants(eventId);

  const isLoading = isLoadingEvent || isLoadingParticipants;

  const handleExportCSV = () => {
    if (!participants || participants.length === 0) return;

    const headers = ["Name", "Email", "Student ID", "Registration Date"];
    const csvContent = [
      headers.join(","),
      ...participants.map(p => 
        `"${p.name}","${p.email}","${p.studentId || 'N/A'}","${format(new Date(p.registeredAt), "yyyy-MM-dd HH:mm:ss")}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event'}_participants.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full bg-background pb-16">
      <div className="border-b bg-muted/20">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {isLoadingEvent ? (
                <>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </>
              ) : event ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                    <Badge variant="secondary" className="text-sm font-medium px-2.5 py-0.5">
                      {event.registeredCount} / {event.capacity} Registered
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participant List
                  </p>
                </>
              ) : null}
            </div>
            <Button 
              variant="outline" 
              className="gap-2 bg-background" 
              onClick={handleExportCSV}
              disabled={!participants || participants.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[30%] pl-6">Participant Info</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right pr-6">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6 py-4">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right pr-6">
                      <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !participants || participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No participants yet</p>
                      <p className="text-sm">When students register, they will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="font-semibold text-foreground">{participant.name}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{participant.email}</div>
                    </TableCell>
                    <TableCell>
                      {participant.studentId ? (
                        <code className="bg-muted px-2 py-1 rounded text-xs font-semibold">
                          {participant.studentId}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(participant.registeredAt), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" asChild>
                        <a href={`mailto:${participant.email}`}>
                          <span className="sr-only">Email {participant.name}</span>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
