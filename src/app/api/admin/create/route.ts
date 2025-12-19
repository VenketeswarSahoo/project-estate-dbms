import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const adminExists = await User.findOne({ email: "admin@estate.com" });
    if (adminExists) {
      return NextResponse.json({
        message: "Admin already exists",
        user: adminExists,
      });
    }

    const admin = await User.create({
      name: "Alice Admin",
      email: "admin@estate.com",
      role: "ADMIN",
      password: "password123",
      avatar: "https://github.com/shadcn.png",
    });

    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;

    return NextResponse.json({
      message: "Admin created successfully",
      user: adminWithoutPassword,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
