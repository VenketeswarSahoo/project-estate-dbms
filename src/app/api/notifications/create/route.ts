import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, title, message, relatedId } = await request.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating notification with relatedId:", relatedId);

    const notification = await Notification.create({
      userId,
      title,
      message,
      relatedId,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
