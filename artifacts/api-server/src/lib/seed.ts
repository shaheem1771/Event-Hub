import { User } from "../models/user";
import { Event } from "../models/event";
import { Registration } from "../models/registration";
import { logger } from "./logger";

export async function seedDatabase(): Promise<void> {
  const existingEvents = await Event.countDocuments();
  if (existingEvents > 0) return;

  logger.info("Seeding database with sample data...");

  const admin = await User.create({
    name: "Admin User",
    email: "admin@college.edu",
    password: "admin123",
    role: "admin",
  });

  const student1 = await User.create({
    name: "Alex Johnson",
    email: "alex@college.edu",
    password: "student123",
    role: "student",
    studentId: "STU-2024-001",
  });

  const student2 = await User.create({
    name: "Maria Garcia",
    email: "maria@college.edu",
    password: "student123",
    role: "student",
    studentId: "STU-2024-002",
  });

  const now = new Date();

  const events = await Event.insertMany([
    {
      title: "Annual Tech Symposium 2025",
      description:
        "A full-day symposium featuring talks from industry leaders, hands-on workshops, and networking sessions. Topics include AI, cloud computing, and the future of software development.",
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: "Main Auditorium, Science Building",
      capacity: 200,
      spotsLeft: 198,
      category: "Technology",
      organizer: "Computer Science Department",
    },
    {
      title: "Campus Art Exhibition: Perspectives",
      description:
        "An immersive showcase of student and faculty artwork exploring themes of identity, nature, and digital culture. Features paintings, sculptures, photography, and interactive installations.",
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: "Gallery Hall, Arts Center",
      capacity: 100,
      spotsLeft: 97,
      category: "Arts & Culture",
      organizer: "Fine Arts Department",
    },
    {
      title: "Career Fair — Spring 2025",
      description:
        "Connect with 50+ companies actively hiring for internships and full-time positions. Bring your resume and dress professionally. Open to all majors.",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: "Student Union Ballroom",
      capacity: 500,
      spotsLeft: 497,
      category: "Career",
      organizer: "Career Services Office",
    },
    {
      title: "Inter-College Basketball Tournament",
      description:
        "Cheer on our college teams as they compete in the inter-college basketball championship. Food stalls, merchandise, and live commentary throughout the event.",
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      location: "Sports Complex",
      capacity: 300,
      spotsLeft: 297,
      category: "Sports",
      organizer: "Athletics Department",
    },
    {
      title: "Leadership & Mindfulness Workshop",
      description:
        "A half-day workshop combining leadership development exercises with mindfulness and stress management techniques. Ideal for students stepping into leadership roles.",
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      location: "Room 204, Management Building",
      capacity: 40,
      spotsLeft: 37,
      category: "Workshop",
      organizer: "Student Affairs Office",
    },
    {
      title: "Open Mic Night",
      description:
        "Share your talent on stage — poetry, music, comedy, spoken word, or anything creative. Sign-ups available at the door. Free entry for all students.",
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      location: "Campus Café, Ground Floor",
      capacity: 80,
      spotsLeft: 77,
      category: "Entertainment",
      organizer: "Student Council",
    },
  ]);

  await Registration.create([
    { eventId: events[0]._id, userId: student1._id, registeredAt: new Date() },
    { eventId: events[0]._id, userId: student2._id, registeredAt: new Date() },
    { eventId: events[1]._id, userId: student1._id, registeredAt: new Date() },
    { eventId: events[4]._id, userId: student2._id, registeredAt: new Date() },
    { eventId: events[4]._id, userId: student1._id, registeredAt: new Date() },
    { eventId: events[5]._id, userId: student2._id, registeredAt: new Date() },
  ]);

  logger.info(
    {
      admin: admin.email,
      students: [student1.email, student2.email],
      events: events.length,
    },
    "Database seeded successfully"
  );
  logger.info("Demo accounts — Admin: admin@college.edu / admin123 | Student: alex@college.edu / student123");
}
