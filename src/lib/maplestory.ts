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

export interface MapleCharacterPopularity {
  date?: string;
  popularity?: number;
}

export interface MapleHyperStatEntry {
  stat_type?: string;
  stat_point?: number;
  stat_level?: number;
  stat_increase?: string;
}

export interface MapleCharacterHyperStat {
  date?: string;
  character_class?: string;
  use_preset_no?: string;
  use_available_hyper_stat?: number;
  hyper_stat_preset_1?: MapleHyperStatEntry[];
  hyper_stat_preset_1_remain_point?: number;
  hyper_stat_preset_2?: MapleHyperStatEntry[];
  hyper_stat_preset_2_remain_point?: number;
  hyper_stat_preset_3?: MapleHyperStatEntry[];
  hyper_stat_preset_3_remain_point?: number;
}

export interface MapleCharacterPropensity {
  date?: string;
  charisma_level?: number;
  sensibility_level?: number;
  insight_level?: number;
  willingness_level?: number;
  handicraft_level?: number;
  charm_level?: number;
}

export interface MapleAbilityInfoEntry {
  ability_no?: string;
  ability_grade?: string;
  ability_value?: string;
}

export interface MapleAbilityPreset {
  ability_preset_grade?: string;
  ability_info?: MapleAbilityInfoEntry[];
}

export interface MapleCharacterAbility {
  date?: string;
  ability_grade?: string;
  ability_info?: MapleAbilityInfoEntry[];
  remain_fame?: number;
  preset_no?: number;
  ability_preset_1?: MapleAbilityPreset;
  ability_preset_2?: MapleAbilityPreset;
  ability_preset_3?: MapleAbilityPreset;
}

export interface MapleCashItemOption {
  option_type?: string;
  option_value?: string;
}

export interface MapleCashItem {
  cash_item_equipment_part?: string;
  cash_item_equipment_slot?: string;
  cash_item_name?: string;
  cash_item_icon?: string;
  cash_item_description?: string;
  cash_item_label?: string;
  cash_item_coloring_prism?: {
    color_range?: string;
    hue?: number;
    saturation?: number;
    value?: number;
  } | null;
  item_gender?: string;
  date_expire?: string;
  date_option_expire?: string;
  skill?: string[];
  cash_item_option?: MapleCashItemOption[];
}

export interface MapleCharacterCashEquipment {
  date?: string;
  character_gender?: string;
  character_class?: string;
  character_look_mode?: string;
  preset_no?: number;
  cash_item_equipment_base?: MapleCashItem[];
  cash_item_equipment_preset_1?: MapleCashItem[];
  cash_item_equipment_preset_2?: MapleCashItem[];
  cash_item_equipment_preset_3?: MapleCashItem[];
}

export interface MapleSymbolEntry {
  symbol_name?: string;
  symbol_icon?: string;
  symbol_description?: string;
  symbol_force?: string;
  symbol_level?: number;
  symbol_str?: string;
  symbol_dex?: string;
  symbol_int?: string;
  symbol_luk?: string;
  symbol_hp?: string;
  symbol_drop_rate?: string;
  symbol_meso_rate?: string;
  symbol_exp_rate?: string;
  symbol_growth_count?: number;
  symbol_require_growth_count?: number;
}

export interface MapleCharacterSymbolEquipment {
  date?: string;
  character_class?: string;
  symbol?: MapleSymbolEntry[];
}

export interface MapleSetEffectTier {
  set_count?: number;
  set_option?: string;
}

export interface MapleSetEffectEntry {
  set_name?: string;
  total_set_count?: number;
  set_effect_info?: MapleSetEffectTier[];
  set_option_full?: MapleSetEffectTier[];
}

export interface MapleCharacterSetEffect {
  date?: string;
  set_effect?: MapleSetEffectEntry[];
}

export interface MapleBeautyInfo {
  hair_name?: string;
  face_name?: string;
  skin_name?: string;
  base_color?: string;
  mix_color?: string;
  mix_rate?: string;
  color_style?: string;
  hue?: number;
  saturation?: number;
  brightness?: number;
}

export interface MapleCharacterBeautyEquipment {
  date?: string;
  character_gender?: string;
  character_class?: string;
  character_hair?: MapleBeautyInfo | null;
  character_face?: MapleBeautyInfo | null;
  character_skin?: MapleBeautyInfo | null;
  character_mark?: MapleBeautyInfo | null;
  character_ear?: MapleBeautyInfo | null;
  character_wing?: MapleBeautyInfo | null;
}

export interface MapleAndroidInfo {
  hair_name?: string;
  base_color?: string;
  mix_color?: string;
  mix_rate?: string;
  face_name?: string;
  skin_name?: string;
  color_style?: string;
  hue?: number;
  saturation?: number;
  brightness?: number;
}

export interface MapleCharacterAndroidEquipment {
  date?: string;
  android_name?: string;
  android_nickname?: string;
  android_icon?: string;
  android_description?: string;
  android_hair?: MapleAndroidInfo | null;
  android_face?: MapleAndroidInfo | null;
  android_skin?: MapleAndroidInfo | null;
  android_cash_item_equipment?: MapleCashItem[];
}

export interface MapleCharacterPetEquipment {
  date?: string;
  pet_1_name?: string;
  pet_1_nickname?: string;
  pet_1_icon?: string;
  pet_1_description?: string;
  pet_1_equipment?: {
    item_name?: string;
    item_icon?: string;
    item_description?: string;
    item_option?: MapleCashItemOption[];
    scroll_upgrade?: number;
    scroll_upgradable?: number;
    item_shape?: string;
    item_shape_icon?: string;
  } | null;
  pet_1_auto_skill?: {
    skill_1?: string;
    skill_1_icon?: string;
    skill_2?: string;
    skill_2_icon?: string;
  } | null;
  pet_1_pet_type?: string;
  pet_1_skill?: string[];
  pet_1_date_expire?: string;
  pet_1_appearance?: string;
  pet_1_appearance_icon?: string;
  pet_2_name?: string;
  pet_2_nickname?: string;
  pet_2_icon?: string;
  pet_2_description?: string;
  pet_2_equipment?: {
    item_name?: string;
    item_icon?: string;
    item_description?: string;
    item_option?: MapleCashItemOption[];
    scroll_upgrade?: number;
    scroll_upgradable?: number;
    item_shape?: string;
    item_shape_icon?: string;
  } | null;
  pet_2_auto_skill?: {
    skill_1?: string;
    skill_1_icon?: string;
    skill_2?: string;
    skill_2_icon?: string;
  } | null;
  pet_2_pet_type?: string;
  pet_2_skill?: string[];
  pet_2_date_expire?: string;
  pet_2_appearance?: string;
  pet_2_appearance_icon?: string;
  pet_3_name?: string;
  pet_3_nickname?: string;
  pet_3_icon?: string;
  pet_3_description?: string;
  pet_3_equipment?: {
    item_name?: string;
    item_icon?: string;
    item_description?: string;
    item_option?: MapleCashItemOption[];
    scroll_upgrade?: number;
    scroll_upgradable?: number;
    item_shape?: string;
    item_shape_icon?: string;
  } | null;
  pet_3_auto_skill?: {
    skill_1?: string;
    skill_1_icon?: string;
    skill_2?: string;
    skill_2_icon?: string;
  } | null;
  pet_3_pet_type?: string;
  pet_3_skill?: string[];
  pet_3_date_expire?: string;
  pet_3_appearance?: string;
  pet_3_appearance_icon?: string;
}

export interface MapleLinkSkill {
  skill_name?: string;
  skill_description?: string;
  skill_level?: number;
  skill_effect?: string;
  skill_effect_next?: string;
  skill_icon?: string;
}

export interface MapleCharacterLinkSkill {
  date?: string;
  character_class?: string;
  character_link_skill?: MapleLinkSkill[];
  character_link_skill_preset_1?: MapleLinkSkill[];
  character_link_skill_preset_2?: MapleLinkSkill[];
  character_link_skill_preset_3?: MapleLinkSkill[];
}

export interface MapleVMatrixCoreSlot {
  slot_id?: string | number;
  slot_level?: number;
  v_core_name?: string;
  v_core_type?: string;
  v_core_level?: number;
  v_core_skill_1?: string | null;
  v_core_skill_2?: string | null;
  v_core_skill_3?: string | null;
  v_core_icon?: string;
  slot_core_name?: string;
  slot_type?: string;
  slot_core_icon?: string;
}

export interface MapleVMatrixCore {
  core_name?: string;
  core_level?: number;
  core_type?: string;
  core_icon?: string;
  skill_description?: string;
  skill_effect?: string;
  skill_effect_next?: string;
  skill_name?: string;
}

export interface MapleCharacterVMatrix {
  date?: string | null;
  character_class?: string;
  character_v_core_equipment?: MapleVMatrixCoreSlot[];
  character_v_matrix_core?: MapleVMatrixCore[];
  character_v_matrix_remain_slot_upgrade_point?: number;
}

export interface MapleHexaMatrixStat {
  slot_id?: string;
  main_stat_name?: string;
  sub_stat_name_1?: string;
  sub_stat_name_2?: string;
  main_stat_level?: number;
  sub_stat_level_1?: number;
  sub_stat_level_2?: number;
  stat_grade?: number;
}

export interface MapleHexaLinkedSkill {
  hexa_skill_id?: string;
}

export interface MapleHexaCoreNode {
  hexa_core_name?: string;
  hexa_core_level?: number;
  hexa_core_type?: string;
  linked_skill?: MapleHexaLinkedSkill[];
}

export interface MapleCharacterHexaMatrix {
  date?: string | null;
  character_class?: string;
  character_hexa_core_equipment?: MapleHexaCoreNode[];
}

export interface MapleCharacterHexaMatrixStat {
  date?: string | null;
  character_class?: string;
  character_hexa_stat_core?: MapleHexaMatrixStat[];
  character_hexa_stat_core_2?: MapleHexaMatrixStat[];
  character_hexa_stat_core_3?: MapleHexaMatrixStat[];
  preset_hexa_stat_core?: MapleHexaMatrixStat[];
  preset_hexa_stat_core_2?: MapleHexaMatrixStat[];
  preset_hexa_stat_core_3?: MapleHexaMatrixStat[];
}

export interface MapleCharacterDojangFloor {
  floor?: number;
  time_record?: number;
  time_record_string?: string;
}

export interface MapleCharacterDojang {
  date?: string;
  character_class?: string;
  character_level?: number;
  dojang_best_floor?: number;
  dojang_best_time?: number;
  dojang_best_floor_class_rank?: number;
  dojang_best_floor_world_rank?: number;
  dojang_best_floor_rank?: number;
  dojang_record?: MapleCharacterDojangFloor[];
}

export type CharacterSectionKey =
  | "basic"
  | "stat"
  | "equipment"
  | "skills"
  | "union";

export interface CharacterSectionMap {
  basic?: {
    profile?: MapleCharacterBasic;
    popularity?: MapleCharacterPopularity | null;
    dojang?: MapleCharacterDojang | null;
  };
  stat?: {
    overview?: MapleCharacterStat | null;
    hyperStat?: MapleCharacterHyperStat | null;
    propensity?: MapleCharacterPropensity | null;
    ability?: MapleCharacterAbility | null;
  };
  equipment?: {
    gear?: MapleCharacterEquipment | null;
    cash?: MapleCharacterCashEquipment | null;
    symbols?: MapleCharacterSymbolEquipment | null;
    setEffects?: MapleCharacterSetEffect | null;
    beauty?: MapleCharacterBeautyEquipment | null;
    android?: MapleCharacterAndroidEquipment | null;
    pets?: MapleCharacterPetEquipment | null;
  };
  skills?: {
    linkSkills?: MapleCharacterLinkSkill | null;
    vmatrix?: MapleCharacterVMatrix | null;
    hexamatrix?: MapleCharacterHexaMatrix | null;
    hexamatrixStat?: MapleCharacterHexaMatrixStat | null;
  };
  union?: MapleUserUnion;
  [key: string]: unknown;
}

export const SKILL_MODULE_KEYS = [
  "linkSkills",
  "vmatrix",
  "hexamatrix",
  "hexamatrixStat",
] as const;

export type SkillModuleKey = (typeof SKILL_MODULE_KEYS)[number];

export function isSkillModuleKey(value: string | null): value is SkillModuleKey {
  return SKILL_MODULE_KEYS.includes(value as SkillModuleKey);
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

const OPTIONAL_EMPTY_STATUS_CODES = new Set<number>([204, 404]);

const ALL_SECTION_KEYS: ReadonlyArray<CharacterSectionKey> = [
  "basic",
  "stat",
  "equipment",
  "skills",
  "union",
] as const;

type SectionFetchResult<Key extends CharacterSectionKey> = {
  section: NonNullable<CharacterSectionMap[Key]>;
  errors?: CharacterDetailsResponse["errors"];
};

type SectionFetcher<Key extends CharacterSectionKey> = (context: {
  ocid: string;
  date?: string;
}) => Promise<SectionFetchResult<Key>>;

type SkillsSectionData = NonNullable<CharacterSectionMap["skills"]>;

function isOptionalModuleError(error: unknown): boolean {
  return (
    error instanceof MapleStoryAPIError &&
    typeof error.status === "number" &&
    OPTIONAL_EMPTY_STATUS_CODES.has(error.status)
  );
}

async function fetchSkillsModules(
  params: {
    ocid: string;
    date?: string;
  },
  modules: readonly SkillModuleKey[] = SKILL_MODULE_KEYS
): Promise<{ data: Partial<SkillsSectionData>; errors: CharacterDetailsResponse["errors"] }> {
  const { ocid, date } = params;
  const data: Partial<SkillsSectionData> = {};
  const errors: CharacterDetailsResponse["errors"] = [];

  const recordError = (module: SkillModuleKey, error: unknown) => {
    errors.push({
      key: `skills.${module}`,
      message: normalizeErrorMessage(error),
    });
  };

  for (const module of modules) {
    switch (module) {
      case "linkSkills":
        data.linkSkills = await fetchOptionalSection<MapleCharacterLinkSkill>(
          "/character/link-skill",
          { ocid, date },
          {
            onError: (error) => recordError(module, error),
          }
        );
        break;
      case "vmatrix":
        data.vmatrix = await fetchOptionalSection<MapleCharacterVMatrix>(
          "/character/vmatrix",
          { ocid, date },
          {
            onError: (error) => recordError(module, error),
          }
        );
        break;
      case "hexamatrix":
        data.hexamatrix = await fetchOptionalSection<MapleCharacterHexaMatrix>(
          "/character/hexamatrix",
          { ocid, date },
          {
            onError: (error) => recordError(module, error),
          }
        );
        break;
      case "hexamatrixStat":
        data.hexamatrixStat =
          await fetchOptionalSection<MapleCharacterHexaMatrixStat>(
            "/character/hexamatrix-stat",
            { ocid, date },
            {
              onError: (error) => recordError(module, error),
            }
          );
        break;
      default:
        break;
    }
  }

  return { data, errors };
}

const SECTION_FETCHERS: {
  [Key in CharacterSectionKey]: SectionFetcher<Key>;
} = {
  basic: async ({ ocid, date }) => {
    const errors: CharacterDetailsResponse["errors"] = [];

    const profile = await fetchFromApi<MapleCharacterBasic>("/character/basic", {
      ocid,
      date,
    });

    const popularity = await fetchOptionalSection<MapleCharacterPopularity>(
      "/character/popularity",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "basic.popularity",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );

    const dojang = await fetchOptionalSection<MapleCharacterDojang>(
      "/character/dojang",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "basic.dojang",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );

    return {
      section: {
        profile,
        popularity,
        dojang,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  },
  stat: async ({ ocid, date }) => {
    const errors: CharacterDetailsResponse["errors"] = [];

    const overview = await fetchOptionalSection<MapleCharacterStat>(
      "/character/stat",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "stat.overview",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const hyperStat = await fetchOptionalSection<MapleCharacterHyperStat>(
      "/character/hyper-stat",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "stat.hyperStat",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const propensity = await fetchOptionalSection<MapleCharacterPropensity>(
      "/character/propensity",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "stat.propensity",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const ability = await fetchOptionalSection<MapleCharacterAbility>(
      "/character/ability",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "stat.ability",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );

    return {
      section: {
        overview,
        hyperStat,
        propensity,
        ability,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  },
  equipment: async ({ ocid, date }) => {
    const errors: CharacterDetailsResponse["errors"] = [];

    const gear = await fetchOptionalSection<MapleCharacterEquipment>(
      "/character/item-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.gear",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const cash = await fetchOptionalSection<MapleCharacterCashEquipment>(
      "/character/cashitem-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.cash",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const symbols = await fetchOptionalSection<MapleCharacterSymbolEquipment>(
      "/character/symbol-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.symbols",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const setEffects = await fetchOptionalSection<MapleCharacterSetEffect>(
      "/character/set-effect",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.setEffects",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const beauty = await fetchOptionalSection<MapleCharacterBeautyEquipment>(
      "/character/beauty-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.beauty",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const android = await fetchOptionalSection<MapleCharacterAndroidEquipment>(
      "/character/android-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.android",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );
    const pets = await fetchOptionalSection<MapleCharacterPetEquipment>(
      "/character/pet-equipment",
      { ocid, date },
      {
        onError: (error) => {
          errors.push({
            key: "equipment.pets",
            message: normalizeErrorMessage(error),
          });
        },
      }
    );

    return {
      section: {
        gear,
        cash,
        symbols,
        setEffects,
        beauty,
        android,
        pets,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  },
  union: async ({ ocid, date }) => {
    const union = await fetchFromApi<MapleUserUnion>("/user/union", {
      ocid,
      date,
    });

    return {
      section: union,
    };
  },
  skills: async ({ ocid, date }) => {
    const { data, errors } = await fetchSkillsModules({ ocid, date });

    return {
      section: data as SkillsSectionData,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
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

async function fetchOptionalSection<T>(
  path: string,
  searchParams: Record<string, string | undefined>,
  options?: {
    onError?: (error: unknown) => void;
  }
): Promise<T | null> {
  try {
    return await fetchFromApi<T>(path, searchParams);
  } catch (error) {
    if (error instanceof MapleStoryAPIError) {
      if (
        typeof error.status === "number" &&
        OPTIONAL_EMPTY_STATUS_CODES.has(error.status)
      ) {
        return null;
      }
    }
    if (options?.onError) {
      options.onError(error);
      return null;
    }
    throw error;
  }
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
      sectionResults[key] = result.value
        .section as CharacterSectionMap[CharacterSectionKey];
      if (result.value.errors && result.value.errors.length > 0) {
        errors.push(...result.value.errors);
      }
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

export async function fetchCharacterSkillModule(
  characterName: string,
  module: SkillModuleKey,
  options?: FetchCharacterDetailsOptions
): Promise<CharacterDetailsResponse> {
  const targetDate = resolveRequestedDate(options?.date);
  const ocid = options?.ocid ?? (await fetchOcid(characterName));
  const { data, errors } = await fetchSkillsModules(
    { ocid, date: targetDate },
    [module]
  );

  return {
    characterName,
    ocid,
    requestedDate: targetDate,
    fetchedAt: new Date().toISOString(),
    sections: {
      skills: data as SkillsSectionData,
    },
    errors,
  };
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
