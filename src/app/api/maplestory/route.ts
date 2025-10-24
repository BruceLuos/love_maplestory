import { NextResponse } from "next/server";

import {
  fetchCharacterDetails,
  fetchCharacterSection,
  fetchCharacterSkillModule,
  isSkillModuleKey,
  MapleStoryAPIError,
} from "@/lib/maplestory";
import type {
  CharacterDetailsResponse,
  CharacterSectionKey,
  SkillModuleKey,
} from "@/lib/maplestory";

const SECTION_KEYS: CharacterSectionKey[] = [
  "basic",
  "stat",
  "equipment",
  "skills",
  "union",
];

type CacheKeyContext = {
  characterName: string;
  date?: string;
  section?: CharacterSectionKey;
  ocid?: string;
  skillModule?: SkillModuleKey;
};

type CacheEntry = {
  expiresAt: number;
  payload: CharacterDetailsResponse;
};

const cache = new Map<string, CacheEntry>();

const cacheTtlMs = Math.max(
  0,
  Number(process.env.MAPLESTORY_API_CACHE_TTL ?? 30_000)
);

function getCacheKey(context: CacheKeyContext): string | null {
  if (cacheTtlMs === 0) {
    return null;
  }

  return JSON.stringify([
    context.characterName,
    context.date ?? null,
    context.section ?? null,
    context.ocid ?? null,
    context.skillModule ?? null,
  ]);
}

function getFromCache(key: string | null): CharacterDetailsResponse | null {
  if (!key) {
    return null;
  }

  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.payload;
}

function setCache(key: string | null, payload: CharacterDetailsResponse) {
  if (!key || cacheTtlMs === 0) {
    return;
  }

  cache.set(key, {
    payload,
    expiresAt: Date.now() + cacheTtlMs,
  });
}

function isSectionKey(value: string | null): value is CharacterSectionKey {
  return Boolean(value && SECTION_KEYS.includes(value as CharacterSectionKey));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterName = searchParams.get("characterName");
  const date = searchParams.get("date") ?? undefined;
  const sectionParam = searchParams.get("section");
  const ocid = searchParams.get("ocid") ?? undefined;
  const skillModuleParam = searchParams.get("skillModule");

  if (sectionParam && !isSectionKey(sectionParam)) {
    return NextResponse.json(
      { error: { message: `Unknown section "${sectionParam}".` } },
      { status: 400 }
    );
  }

  const section = sectionParam ? (sectionParam as CharacterSectionKey) : undefined;
  const skillModule = skillModuleParam
    ? (skillModuleParam as SkillModuleKey)
    : undefined;

  if (!characterName) {
    return NextResponse.json(
      { error: { message: "Missing characterName query parameter." } },
      { status: 400 }
    );
  }

  if (skillModuleParam) {
    if (!section || section !== "skills") {
      return NextResponse.json(
        {
          error: {
            message:
              'The "skillModule" parameter can only be used when section=skills.',
          },
        },
        { status: 400 }
      );
    }

    if (!isSkillModuleKey(skillModuleParam)) {
      return NextResponse.json(
        { error: { message: `Unknown skill module "${skillModuleParam}".` } },
        { status: 400 }
      );
    }
  }

  const cacheKey = getCacheKey({
    characterName,
    date,
    section,
    ocid,
    skillModule,
  });

  const cached = getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "x-maplestory-cache": "HIT",
      },
    });
  }

  try {
    const data = skillModule
      ? await fetchCharacterSkillModule(characterName, skillModule, {
          date,
          ocid,
        })
      : section
        ? await fetchCharacterSection({
            characterName,
            section,
            date,
            ocid,
          })
        : await fetchCharacterDetails(characterName, { date, ocid });

    setCache(cacheKey, data);

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
