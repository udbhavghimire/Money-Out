import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const activities = await db.activity.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 50, // Limit to last 50 activities
      });

      return res.status(200).json(activities);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch activities" });
    }
  }

  if (req.method === "POST") {
    try {
      const activity = await db.activity.create({
        data: {
          type: req.body.type,
          details: req.body.details,
          amount: req.body.amount,
          userId: session.user.id,
          timestamp: new Date(),
        },
      });

      return res.status(201).json(activity);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create activity" });
    }
  }
}
