import { NextResponse } from "next/server";

import { fetchCharacterDetails, MapleStoryAPIError } from "@/lib/maplestory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterName = searchParams.get("characterName");
  const date = searchParams.get("date") ?? undefined;

  console.log("character", characterName);

  if (!characterName) {
    return NextResponse.json(
      { error: { message: "Missing characterName query parameter." } },
      { status: 400 }
    );
  }

  try {
    const data = await fetchCharacterDetails(characterName, { date });
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
