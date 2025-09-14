import { timetable } from "@/lib/timetable";

export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify(await timetable()));
}
