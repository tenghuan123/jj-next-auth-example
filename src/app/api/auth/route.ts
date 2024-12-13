import { getUser } from "@/components/auth/get-user";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getUser();

  return NextResponse.json(session);
}
