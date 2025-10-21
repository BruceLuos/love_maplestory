const API_BASE_URL = "https://open.api.nexon.com/maplestorytw/v1";

/**
 * Simplified subset of the MapleStory TW open API response types. Only the
 * properties that are surfaced in the UI are defined to keep maintenance
 * simple while still providing type safety.
 */
export interface MapleCharacterBasic {
  date?: string;
  character_name: string;
  world_name?: string;
  character_class?: string;
  character_level?: number;
  character_exp?: number;
  character_exp_rate?: string;
  character_guild_name?: string;
  character_image?: string;
}

export interface MapleStatEntry {
  stat_name: string;
  stat_value: string;
}

export interface MapleCharacterStat {
  date?: string;
  character_level?: number;
  final_stat?: MapleStatEntry[];
  remain_ap?: number;
  remain_hp?: number;
  remain_mp?: number;
  remain_minimum_star_force?: number;
}

export interface MapleEquipmentItem {
  slot_name: string;
  item_name: string;
  item_icon?: string;
  potential_option_grade?: string;
  potential_option_1?: string;
  potential_option_2?: string;
  potential_option_3?: string;
  additional_potential_option_grade?: string;
  additional_potential_option_1?: string;
  additional_potential_option_2?: string;
  additional_potential_option_3?: string;
  starforce?: number;
}

export interface MapleCharacterEquipment {
  date?: string;
  character_gender?: string;
  character_class?: string;
  item_equipment?: MapleEquipmentItem[];
  item_title?: {
    title_name?: string;
  } | null;
}

export interface MapleUserUnion {
  date?: string;
  union_level?: number;
  union_grade?: string;
  union_attack_power?: number;
  union_artifact_level: number;
  union_artifact_exp: number;
  union_artifact_point: number;
}

export interface MapleCharacterSkill {
  skill_name: string;
  skill_description?: string;
  skill_level?: number;
  skill_effect?: string;
  skill_icon?: string;
}

export interface MapleCharacterSkillSet {
  date?: string;
  character_class?: string;
  character_skill_grade: string;
  character_skill: MapleCharacterSkill[];
}

export type CharacterSectionKey =
  | "basic"
  | "stat"
  | "equipment"
  | "skills"
  | "union";

export interface CharacterSectionMap {
  basic?: MapleCharacterBasic;
  stat?: MapleCharacterStat;
  equipment?: MapleCharacterEquipment;
  skills?: MapleCharacterSkillSet[];
  union?: MapleUserUnion;
  [key: string]: unknown;
}

export interface CharacterDetailsResponse {
  characterName: string;
  ocid: string;
  requestedDate?: string;
  fetchedAt: string;
  sections: CharacterSectionMap;
  errors: Array<{ key: CharacterSectionKey | string; message: string }>;
}

export class MapleStoryAPIError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "MapleStoryAPIError";
    this.status = status;
    this.details = details;
  }
}

const SKILL_GRADES = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "hyperpassive",
  "hyperactive",
];

const ALL_SECTION_KEYS: ReadonlyArray<CharacterSectionKey> = [
  "basic",
  "stat",
  "equipment",
  "skills",
  "union",
] as const;

type SectionFetcher<Key extends CharacterSectionKey> = (context: {
  ocid: string;
  date?: string;
}) => Promise<NonNullable<CharacterSectionMap[Key]>>;

const SECTION_FETCHERS: {
  [Key in CharacterSectionKey]: SectionFetcher<Key>;
} = {
  basic: async ({ ocid, date }) =>
    fetchFromApi<MapleCharacterBasic>("/character/basic", { ocid, date }),
  stat: async ({ ocid, date }) =>
    fetchFromApi<MapleCharacterStat>("/character/stat", { ocid, date }),
  equipment: async ({ ocid, date }) =>
    fetchFromApi<MapleCharacterEquipment>("/character/item-equipment", {
      ocid,
      date,
    }),
  union: async ({ ocid, date }) =>
    fetchFromApi<MapleUserUnion>("/user/union", { ocid, date }),
  skills: async ({ ocid, date }) => fetchSkills(ocid, date),
};

function ensureApiKey(): string {
  const key = process.env.NEXON_OPEN_API_KEY;
  if (!key) {
    throw new MapleStoryAPIError(
      "Missing Nexon Open API key. Set NEXON_OPEN_API_KEY in your environment."
    );
  }
  return key;
}

function buildUrl(
  path: string,
  searchParams: Record<string, string | undefined>
) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(searchParams).forEach(([param, value]) => {
    if (value) {
      url.searchParams.set(param, value);
    }
  });
  return url;
}

async function fetchFromApi<T>(
  path: string,
  searchParams: Record<string, string | undefined>
): Promise<T> {
  const apiKey = ensureApiKey();
  const url = buildUrl(path, searchParams);

  const response = await fetch(url, {
    headers: {
      "x-nxopen-api-key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    let errorDetails: unknown = null;
    let rawBody: string | null = null;
    try {
      rawBody = await response.text();
    } catch {
      rawBody = null;
    }
    if (rawBody) {
      try {
        errorDetails = JSON.parse(rawBody);
      } catch {
        errorDetails = rawBody;
      }
    }
    throw new MapleStoryAPIError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
      errorDetails
    );
  }

  return (await response.json()) as T;
}

async function fetchOcid(characterName: string): Promise<string> {
  const data = await fetchFromApi<{ ocid?: string }>("/id", {
    character_name: characterName,
  });

  if (!data.ocid) {
    throw new MapleStoryAPIError(
      `角色「${characterName}」未找到，請確認角色名稱是否正確。`,
      404
    );
  }

  return data.ocid;
}

function resolveRequestedDate(date?: string): string | undefined {
  if (!date) {
    return undefined;
  }
  return date;
}

function resolveSectionKeys(
  sections?: readonly CharacterSectionKey[]
): CharacterSectionKey[] {
  if (!sections || sections.length === 0) {
    return [...ALL_SECTION_KEYS];
  }
  return Array.from(new Set(sections));
}

async function fetchSectionsForOcid(
  ocid: string,
  sectionKeys: readonly CharacterSectionKey[],
  date?: string
): Promise<{
  sections: CharacterSectionMap;
  errors: CharacterDetailsResponse["errors"];
}> {
  const sectionResults: Partial<
    Record<CharacterSectionKey, CharacterSectionMap[CharacterSectionKey]>
  > = {};
  if (sectionKeys.length === 0) {
    return { sections: sectionResults as CharacterSectionMap, errors: [] };
  }

  const results = await Promise.allSettled(
    sectionKeys.map((key) => SECTION_FETCHERS[key]({ ocid, date }))
  );

  const errors: CharacterDetailsResponse["errors"] = [];

  results.forEach((result, index) => {
    const key = sectionKeys[index]!;
    if (result.status === "fulfilled") {
      sectionResults[key] =
        result.value as CharacterSectionMap[CharacterSectionKey];
    } else {
      errors.push({
        key,
        message: normalizeErrorMessage(result.reason),
      });
    }
  });

  return { sections: sectionResults as CharacterSectionMap, errors };
}

export interface FetchCharacterDetailsOptions {
  date?: string;
  sections?: readonly CharacterSectionKey[];
  ocid?: string;
}

export async function fetchCharacterDetails(
  characterName: string,
  options?: FetchCharacterDetailsOptions
): Promise<CharacterDetailsResponse> {
  const targetDate = resolveRequestedDate(options?.date);
  const sectionKeys = resolveSectionKeys(options?.sections);
  const ocid = options?.ocid ?? (await fetchOcid(characterName));
  const { sections, errors } = await fetchSectionsForOcid(
    ocid,
    sectionKeys,
    targetDate
  );

  return {
    characterName,
    ocid,
    requestedDate: targetDate,
    fetchedAt: new Date().toISOString(),
    sections,
    errors,
  };
}

export interface FetchCharacterSectionOptions {
  characterName: string;
  section: CharacterSectionKey;
  date?: string;
  ocid?: string;
}

export async function fetchCharacterSection(
  options: FetchCharacterSectionOptions
): Promise<CharacterDetailsResponse> {
  return fetchCharacterDetails(options.characterName, {
    date: options.date,
    sections: [options.section],
    ocid: options.ocid,
  });
}

async function fetchSkills(
  ocid: string,
  date?: string
): Promise<MapleCharacterSkillSet[]> {
  const results = await Promise.allSettled(
    SKILL_GRADES.map((grade) =>
      fetchFromApi<MapleCharacterSkillSet>("/character/skill", {
        ocid,
        date,
        character_skill_grade: grade,
      })
    )
  );

  const skillSets: MapleCharacterSkillSet[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      skillSets.push(result.value);
    } else if (result.reason instanceof MapleStoryAPIError) {
      // Ignore 404s for unavailable skill grades to avoid noisy error output.
      if (result.reason.status && result.reason.status >= 500) {
        throw result.reason;
      }
    }
  });

  return skillSets.filter((skillSet) => skillSet.character_skill.length > 0);
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof MapleStoryAPIError) {
    if (
      typeof error.details === "object" &&
      error.details &&
      "error" in error.details
    ) {
      const detail = (error.details as { error?: { message?: string } }).error
        ?.message;
      if (detail) {
        return detail;
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
