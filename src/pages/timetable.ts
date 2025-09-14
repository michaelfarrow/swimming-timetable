import { timetable } from "@/lib/timetable";

export async function GET() {
  return new Response(JSON.stringify(await timetable()));
}
