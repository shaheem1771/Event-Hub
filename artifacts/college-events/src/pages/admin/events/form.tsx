import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  useCreateEvent, 
  useGetEvent, 
  useUpdateEvent,
  getListAdminEventsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Loader2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(2, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  category: z.string().min(1, "Category is required"),
  organizer: z.string().min(2, "Organizer is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type EventFormValues = z.infer<typeof eventSchema>;

const categories = [
  "Academic", "Social", "Sports", "Career", "Workshop", "Other"
];

export default function AdminEventForm() {
  const [matchEdit, params] = useRoute("/admin/events/:id/edit");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const isEditing = matchEdit;
  const eventId = params?.id;

  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId || "", {
    query: {
      enabled: isEditing && !!eventId,
    }
  });

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: 50,
      category: "",
      organizer: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (isEditing && event) {
      const d = new Date(event.date);
      form.reset({
        title: event.title,
        description: event.description,
        date: format(d, "yyyy-MM-dd"),
        time: format(d, "HH:mm"),
        location: event.location,
        capacity: event.capacity,
        category: event.category,
        organizer: event.organizer,
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event, isEditing, form]);

  const onSubmit = (data: EventFormValues) => {
    // Combine date and time
    const dateTime = new Date(`${data.date}T${data.time}`).toISOString();
    
    const payload = {
      title: data.title,
      description: data.description,
      date: dateTime,
      location: data.location,
      capacity: data.capacity,
      category: data.category,
      organizer: data.organizer,
      imageUrl: data.imageUrl || null,
    };

    if (isEditing && eventId) {
      updateEvent.mutate({ id: eventId, data: payload }, {
        onSuccess: () => {
          toast.success("Event updated successfully");
          queryClient.invalidateQueries({ queryKey: getListAdminEventsQueryKey() });
          setLocation("/admin/events");
        },
        onError: (err) => {
          toast.error(err.data?.error || "Failed to update event");
        }
      });
    } else {
      createEvent.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Event created successfully");
          queryClient.invalidateQueries({ queryKey: getListAdminEventsQueryKey() });
          setLocation("/admin/events");
        },
        onError: (err) => {
          toast.error(err.data?.error || "Failed to create event");
        }
      });
    }
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  if (isEditing && isLoadingEvent) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-muted/20 pb-24">
      <div className="bg-background border-b sticky top-16 z-40">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/events">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h1>
          </div>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isPending}
            className="gap-2 shadow-sm rounded-full px-6"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? "Save Changes" : "Publish Event"}
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border shadow-sm rounded-2xl p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <h2>Basic Information</h2>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Spring Music Festival" className="text-lg py-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what the event is about, what attendees can expect..." 
                          className="min-h-[120px] resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organizer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Student Union" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Time & Place */}
              <div className="space-y-6 pt-6">
                <div className="text-lg font-semibold border-b pb-2">
                  <h2>Time & Place</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Main Auditorium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum number of attendees allowed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-6 pt-6">
                <div className="text-lg font-semibold border-b pb-2">
                  <h2>Media</h2>
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a URL to an image that will be used as the cover for this event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("imageUrl") && !form.formState.errors.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border bg-muted aspect-[21/9] relative">
                    <img 
                      src={form.watch("imageUrl")} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).classList.add('hidden');
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).classList.remove('hidden');
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center -z-10 text-muted-foreground text-sm">
                      Invalid image URL
                    </div>
                  </div>
                )}
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
