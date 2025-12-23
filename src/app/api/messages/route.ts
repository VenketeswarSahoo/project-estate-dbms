import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import NotificationModel from "@/models/Notification";
import User from "@/models/User";
import { messageNotificationTemplate } from "@/lib/templates/emailTemplates";
import { sendMail } from "@/lib/utils/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");
    const itemId = searchParams.get("itemId");

    const query: any = {};
    if (senderId) query.senderId = senderId;
    if (receiverId) query.receiverId = receiverId;
    if (itemId) query.itemId = itemId;

    const messages = await Message.find(query).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const newMessage = await Message.create(data);
    const message = Array.isArray(newMessage) ? newMessage[0] : newMessage;

    // Background task: Handle notification and email
    (async () => {
      try {
        if (message.receiverId && message.senderId !== message.receiverId) {
          const user = await User.findById(message.receiverId);
          const sender = await User.findById(message.senderId);

          if (user) {
            // Create in-app notification
            await NotificationModel.create({
              userId: message.receiverId,
              title: `${sender?.name || "Someone"} sent you a message`,
              message: "Please check your inbox to read it.",
              relatedId: String(message._id || message.id),
            });

            // Send email notification
            if (user.email) {
              const emailHtml = messageNotificationTemplate({
                recipientName: user.name,
              });
              await sendMail({
                to: user.email,
                subject: "New Message Notification - Onarach Estate App",
                html: emailHtml,
              });
              console.log(`Email notification sent to ${user.email}`);
            }
          }
        }
      } catch (backgroundError) {
        console.error("Background notification error:", backgroundError);
      }
    })();

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const { ids, update } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty IDs array" },
        { status: 400 }
      );
    }

    const result = await Message.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );

    // If marking as read, update related notifications
    if (update.read) {
      console.log("Marking notifications as read for message IDs:", ids);
      // Import Notification here to avoid circular dependencies if any,
      // though typically models are fine.
      const updateResult = await NotificationModel.updateMany(
        { relatedId: { $in: ids } },
        { $set: { isRead: true } }
      );
      console.log("Notification update result:", updateResult);
    }

    return NextResponse.json({
      message: "Messages updated successfully",
      count: result.modifiedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
