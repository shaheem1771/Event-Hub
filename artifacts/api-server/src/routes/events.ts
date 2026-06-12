import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import { Event } from "../models/event";
import { Registration } from "../models/registration";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
  RegisterForEventParams,
  UnregisterFromEventParams,
  GetEventParticipantsParams,
} from "@workspace/api-zod";
import { User } from "../models/user";

const router: IRouter = Router();

function toEventResponse(event: InstanceType<typeof Event>, registeredCount: number, isRegistered?: boolean | null) {
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
    isRegistered: isRegistered ?? null,
    imageUrl: event.imageUrl ?? null,
    createdAt: event.createdAt,
  };
}

router.get("/events", async (req, res): Promise<void> => {
  const params = ListEventsQueryParams.safeParse(req.query);
  const { category, search, upcoming } = params.success ? params.data : {};

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (upcoming === "true") {
    filter.date = { $gte: new Date() };
  }

  const events = await Event.find(filter).sort({ date: 1 });

  let authUserId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const jwt = (await import("jsonwebtoken")).default;
      const secret = process.env.SESSION_SECRET!;
      const payload = jwt.verify(authHeader.slice(7), secret) as { userId: string };
      authUserId = payload.userId;
    } catch {
    }
  }

  const eventIds = events.map((e) => e._id);
  const regCounts = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count as number]));

  let myRegs: Set<string> = new Set();
  if (authUserId) {
    const myRegistrations = await Registration.find({
      eventId: { $in: eventIds },
      userId: new mongoose.Types.ObjectId(authUserId),
    });
    myRegs = new Set(myRegistrations.map((r) => r.eventId.toString()));
  }

  res.json(
    events.map((e) =>
      toEventResponse(e, countMap.get(e.id) ?? 0, authUserId ? myRegs.has(e.id) : null)
    )
  );
});

router.post("/events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, description, date, location, capacity, category, organizer, imageUrl } = parsed.data;
  const event = await Event.create({
    title,
    description,
    date: new Date(date),
    location,
    capacity,
    spotsLeft: capacity,
    category,
    organizer,
    imageUrl: imageUrl ?? null,
  });

  res.status(201).json(toEventResponse(event, 0, null));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const event = await Event.findById(params.data.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const registeredCount = await Registration.countDocuments({ eventId: event._id });

  let isRegistered: boolean | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const jwt = (await import("jsonwebtoken")).default;
      const secret = process.env.SESSION_SECRET!;
      const payload = jwt.verify(authHeader.slice(7), secret) as { userId: string };
      const reg = await Registration.findOne({
        eventId: event._id,
        userId: new mongoose.Types.ObjectId(payload.userId),
      });
      isRegistered = !!reg;
    } catch {
    }
  }

  res.json(toEventResponse(event, registeredCount, isRegistered));
});

router.put("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (updates.date) updates.date = new Date(updates.date as string);

  const event = await Event.findByIdAndUpdate(params.data.id, updates, { new: true });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const registeredCount = await Registration.countDocuments({ eventId: event._id });
  res.json(toEventResponse(event, registeredCount, null));
});

router.delete("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const event = await Event.findByIdAndDelete(params.data.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await Registration.deleteMany({ eventId: event._id });
  res.sendStatus(204);
});

router.post("/events/:id/registrations", requireAuth, async (req, res): Promise<void> => {
  const params = RegisterForEventParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const event = await Event.findById(params.data.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const existing = await Registration.findOne({ eventId: event._id, userId });
  if (existing) {
    res.status(400).json({ error: "You are already registered for this event" });
    return;
  }

  if (event.spotsLeft <= 0) {
    res.status(400).json({ error: "This event is full" });
    return;
  }

  const registration = await Registration.create({
    eventId: event._id,
    userId,
    registeredAt: new Date(),
  });

  await Event.findByIdAndUpdate(event._id, { $inc: { spotsLeft: -1 } });

  res.status(201).json({
    id: registration.id,
    eventId: event.id,
    userId: req.user!.userId,
    registeredAt: registration.registeredAt,
  });
});

router.delete("/events/:id/registrations", requireAuth, async (req, res): Promise<void> => {
  const params = UnregisterFromEventParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const event = await Event.findById(params.data.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const registration = await Registration.findOneAndDelete({ eventId: event._id, userId });
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  await Event.findByIdAndUpdate(event._id, { $inc: { spotsLeft: 1 } });
  res.sendStatus(204);
});

router.get("/events/:id/participants", requireAdmin, async (req, res): Promise<void> => {
  const params = GetEventParticipantsParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const event = await Event.findById(params.data.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const registrations = await Registration.find({ eventId: event._id }).populate<{
    userId: InstanceType<typeof User>;
  }>("userId", "name email studentId");

  res.json(
    registrations.map((r) => ({
      id: r.id,
      name: r.userId.name,
      email: r.userId.email,
      studentId: r.userId.studentId ?? null,
      registeredAt: r.registeredAt,
    }))
  );
});

export default router;
