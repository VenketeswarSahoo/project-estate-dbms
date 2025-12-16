import dbConnect from "@/lib/db";
import Message from "@/models/Message";
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
    const message = await Message.create(data);
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
