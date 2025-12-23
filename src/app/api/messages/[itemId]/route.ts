import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import NotificationModel from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  try {
    await dbConnect();
    const params = await props.params;
    const data = await request.json();
    const { itemId } = params;

    const message = await Message.findByIdAndUpdate(itemId, data, {
      new: true,
      runValidators: true,
    });

    if (data.read) {
      console.log("Marking notification as read for message ID:", itemId);
      await NotificationModel.findOneAndUpdate(
        { relatedId: itemId },
        { isRead: true }
      );
    }

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  try {
    await dbConnect();
    const params = await props.params;
    const { itemId } = params;

    const message = await Message.findByIdAndDelete(itemId);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
