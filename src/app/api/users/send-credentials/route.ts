import { introductoryEmailTemplate } from "@/lib/templates/emailTemplates";
import { sendMail } from "@/lib/utils/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, role, password } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const html = introductoryEmailTemplate({ email, role, password });
    await sendMail({
      to: email,
      subject: `Welcome to Our System, Estate Software`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending intro email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
