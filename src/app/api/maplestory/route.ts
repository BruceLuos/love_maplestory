import { NextResponse } from "next/server";

import {
  fetchCharacterDetails,
  fetchCharacterSection,
  MapleStoryAPIError,
} from "@/lib/maplestory";
import type { CharacterSectionKey } from "@/lib/maplestory";

const SECTION_KEYS: CharacterSectionKey[] = [
  "basic",
  "stat",
  "equipment",
  "skills",
  "union",
];

function isSectionKey(value: string | null): value is CharacterSectionKey {
  return Boolean(value && SECTION_KEYS.includes(value as CharacterSectionKey));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterName = searchParams.get("characterName");
  const date = searchParams.get("date") ?? undefined;
  const sectionParam = searchParams.get("section");
  const ocid = searchParams.get("ocid") ?? undefined;

  if (sectionParam && !isSectionKey(sectionParam)) {
    return NextResponse.json(
      { error: { message: `Unknown section "${sectionParam}".` } },
      { status: 400 }
    );
  }

  const section = sectionParam ? (sectionParam as CharacterSectionKey) : undefined;

  console.log("character", characterName);

  if (!characterName) {
    return NextResponse.json(
      { error: { message: "Missing characterName query parameter." } },
      { status: 400 }
    );
  }

  try {
    const data = section
      ? await fetchCharacterSection({
          characterName,
          section,
          date,
          ocid,
        })
      : await fetchCharacterDetails(characterName, { date });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof MapleStoryAPIError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            status: error.status,
            details: error.details ?? null,
          },
        },
        { status: error.status ?? 500 }
      );
    }

    console.error(`[maplestory] unexpected error`, error);
    return NextResponse.json(
      {
        error: {
          message: "Failed to fetch character data.",
        },
      },
      { status: 500 }
    );
  }
}
