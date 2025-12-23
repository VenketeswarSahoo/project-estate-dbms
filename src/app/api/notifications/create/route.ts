import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { messageNotificationTemplate } from "@/lib/templates/emailTemplates";
import { sendMail } from "@/lib/utils/nodemailer";
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

    // Send email notification if it's a message
    // Send email notification if it's a message
    console.log("Checking if email should be sent. Title:", title);
    if (title.includes("sent you a message")) {
      console.log("Title matches message notification pattern.");
      try {
        console.log("Fetching user for email notification. UserId:", userId);
        const user = await User.findById(userId);
        if (user) {
          console.log("User found:", user.email);
          if (user.email) {
            const emailHtml = messageNotificationTemplate({
              recipientName: user.name,
            });
            console.log("Sending email to:", user.email);
            await sendMail({
              to: user.email,
              subject: "New Message Notification - Onarach Estate App",
              html: emailHtml,
            });
            console.log(`Email notification sent to ${user.email}`);
          } else {
            console.log("User has no email address.");
          }
        } else {
          console.log("User not found for ID:", userId);
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue execution even if email fails
      }
    } else {
      console.log("Title does NOT match message notification pattern.");
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
