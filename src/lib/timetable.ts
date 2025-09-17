import * as z from "zod";
import lodash from "lodash";
import type { SetNonNullableDeep } from "type-fest";
import { fetchWithProxy } from "@/lib/fetch";
import { getCache } from "@vercel/functions";

const { chain } = lodash;

const Data = z.union([
  z.object({
    items: z.array(
      z.object({
        short_description: z.string(),
        full_description: z.string(),
        description: z.string(),
        booking_url: z.url(),
        spaces: z.object({
          capacity: z.coerce.number(),
          available: z.coerce.number(),
          waiting: z.coerce.number(),
        }),
        times: z.record(
          z.union([
            z.literal("Monday"),
            z.literal("Tuesday"),
            z.literal("Wednesday"),
            z.literal("Thursday"),
            z.literal("Friday"),
            z.literal("Saturday"),
            z.literal("Sunday"),
          ]),
          z.array(
            z.object({
              description: z.string(),
              start: z.iso.time(),
              end: z.iso.time(),
            }),
          ),
        ),
      }),
    ),
  }),
  z.object({
    error: z.string(),
  }),
]);

type Data = Extract<z.infer<typeof Data>, { items: any }>;
type Item = Data["items"][number];
type Times = Data["items"][number]["times"];
type Day = keyof Times;
type Time = Times[Day][number];

const CENTER = "0169";
const SEARCH = ["swimming", "fast"];
const MIN_TIME: { [key in Day]?: number } = {
  Monday: 16,
  Tuesday: 16,
  Wednesday: 16,
  Thursday: 16,
  Friday: 16,
  Saturday: 11,
  Sunday: 11,
};
const SPECIFIC_TIMES: { [key in Day]?: number | number[] } = {
  Monday: 12,
  Tuesday: 12,
  Wednesday: 12,
  Thursday: 12,
  Friday: 12,
};

function parseTime(time: string) {
  const parsedTime = time.match(/^(\d{2}):(\d{2})$/);
  if (parsedTime) {
    return {
      hour: Number(parsedTime[1]),
      minute: Number(parsedTime[2]),
    };
  }
  return null;
}

function mapTimes(day: Day, times: Time[]) {
  const minTime = MIN_TIME[day];
  const specificTimes = SPECIFIC_TIMES[day];

  return chain(times)
    .mapValues((time) => {
      return {
        ...time,
        startParsed: parseTime(time.start),
        endParsed: parseTime(time.end),
      };
    })
    .filter(
      (
        time,
      ): time is SetNonNullableDeep<
        typeof time,
        "startParsed" | "endParsed"
      > => {
        return Boolean(time.startParsed && time.endParsed);
      },
    )
    .filter((time) => {
      const hour = time.startParsed.hour;
      const passSpecific = Boolean(
        specificTimes && [specificTimes].flat().includes(hour),
      );
      const passMin = Boolean(minTime && hour >= minTime);
      return passSpecific || passMin;
    })
    .sortBy((time) => time.startParsed.hour)
    .value();
}

function mapItem(item: Item) {
  return {
    ...item,
    times: Object.entries(item.times).map(([day, times]) => {
      return { day, times: mapTimes(day, times) };
    }),
  };
}

function parseData(data: Data) {
  return data.items
    .filter((item) => {
      const haystack = item.short_description.toLowerCase();
      for (const needle of SEARCH) {
        if (!haystack.includes(needle)) return false;
      }
      return true;
    })
    .map(mapItem);
}

export async function timetable() {
  const cache = getCache();
  const cacheKey = `${CENTER}/timetable`;

  const cachedVal: Data | null = (await cache.get(cacheKey)) as any;

  // try {
  // const res = await client.request({
  //   url: `https://api.everyoneactive.com/v1.0/centres/${CENTER}/timetable`,
  //   method: "GET",
  //   responseType: "json",
  //   headers: {
  //     "User-Agent":
  //       "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
  //   },
  //   validateStatus: () => true,
  // });

  const res = await fetchWithProxy(
    `https://api.everyoneactive.com/v1.0/centres/${CENTER}/timetable`,
    {
      signal: AbortSignal.timeout(2.5 * 1000),
    },
  );

  const data = Data.parse(await res.json());

  if ("error" in data) return cachedVal ? parseData(cachedVal) : data;

  await cache.set(cacheKey, data, { ttl: 3600 });

  return parseData(data);
  // } catch (e: any) {
  //   return {
  //     error:
  //       (e && e.statusMessage) || (e && e.message) || "Something went wrong",
  //   };
  // }
}
