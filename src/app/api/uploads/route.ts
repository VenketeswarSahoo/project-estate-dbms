import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { verifyToken } from "@/lib/utils/jwt";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "estate-files";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase Storage is not configured");
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), supabaseKey, bucket };
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = formData.get("category");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }
    if (category !== "items" && category !== "avatars" && category !== "files") {
      return NextResponse.json({ error: "Invalid upload category" }, { status: 400 });
    }
    if (category === "avatars" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Avatar uploads must be images" },
        { status: 415 }
      );
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Supported files are JPEG, PNG, WebP, and PDF" },
        { status: 415 }
      );
    }
    const maxSize = category === "avatars" ? 2 * 1024 * 1024 : MAX_FILE_SIZE;
    if (file.size === 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: `File must be between 1 byte and ${maxSize / 1024 / 1024} MB` },
        { status: 413 }
      );
    }

    const { supabaseUrl, supabaseKey, bucket } = getConfig();
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
    const objectPath = `${category}/${randomUUID()}.${extension}`;
    const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file,
        cache: "no-store",
      }
    );

    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text();
      console.error("Supabase Storage upload failed:", uploadResponse.status, detail);
      return NextResponse.json(
        { error: "Supabase Storage upload failed. Check the bucket and credentials." },
        { status: 502 }
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
