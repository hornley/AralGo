import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "AralGo",
    timestamp: new Date().toISOString(),
  });
}
