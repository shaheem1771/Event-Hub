import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/auth";
import { Event } from "../models/event";
import { Registration } from "../models/registration";
import { User } from "../models/user";

const router: IRouter = Router();

function toAdminEvent(event: InstanceType<typeof Event>, registeredCount: number) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    spotsLeft: event.spotsLeft,
    category: event.category,
    organizer: event.organizer,
    registeredCount,
    imageUrl: event.imageUrl ?? null,
    createdAt: event.createdAt,
  };
}

router.get("/admin/dashboard", requireAdmin, async (req, res): Promise<void> => {
  const [totalEvents, totalStudents, totalRegistrations, upcomingEventsCount] = await Promise.all([
    Event.countDocuments(),
    User.countDocuments({ role: "student" }),
    Registration.countDocuments(),
    Event.countDocuments({ date: { $gte: new Date() } }),
  ]);

  const topEventIds = await Registration.aggregate([
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const popularEventDocs = await Event.find({
    _id: { $in: topEventIds.map((t) => t._id) },
  });

  const countByEvent = new Map(topEventIds.map((t) => [t._id.toString(), t.count as number]));
  const popularEvents = popularEventDocs.map((e) =>
    toAdminEvent(e, countByEvent.get(e.id) ?? 0)
  );

  res.json({
    totalEvents,
    totalStudents,
    totalRegistrations,
    upcomingEvents: upcomingEventsCount,
    popularEvents,
  });
});

router.get("/admin/events", requireAdmin, async (req, res): Promise<void> => {
  const events = await Event.find().sort({ date: -1 });

  const regCounts = await Registration.aggregate([
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count as number]));

  res.json(events.map((e) => toAdminEvent(e, countMap.get(e.id) ?? 0)));
});

export default router;
