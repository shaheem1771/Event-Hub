import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/auth";
import { Event } from "../models/event";
import { Registration } from "../models/registration";

const router: IRouter = Router();

router.get("/students/events", requireAuth, async (req, res): Promise<void> => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const registrations = await Registration.find({ userId }).sort({ registeredAt: -1 });
  const eventIds = registrations.map((r) => r.eventId);

  const events = await Event.find({ _id: { $in: eventIds } });

  const regCounts = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count as number]));

  res.json(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      location: e.location,
      capacity: e.capacity,
      spotsLeft: e.spotsLeft,
      category: e.category,
      organizer: e.organizer,
      registeredCount: countMap.get(e.id) ?? 0,
      isRegistered: true,
      imageUrl: e.imageUrl ?? null,
      createdAt: e.createdAt,
    }))
  );
});

export default router;
