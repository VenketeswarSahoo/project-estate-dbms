import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/utils/jwt";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const user = await User.findById(decoded.id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
