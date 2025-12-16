import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Check if admin exists
    const adminExists = await User.findOne({ role: "ADMIN" });
    if (adminExists) {
      return NextResponse.json({
        message: "Admin already exists",
        user: adminExists,
      });
    }

    const admin = await User.create({
      name: "Alice Admin",
      email: "alice@estate.com",
      role: "ADMIN",
      password: "password123",
      avatar: "https://github.com/shadcn.png",
    });

    return NextResponse.json({
      message: "Admin created successfully",
      user: admin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
