"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  RefreshCcw,
  Search,
  ShieldQuestion,
  UserCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import type {
  CharacterDetailsResponse,
  CharacterSectionMap,
  CharacterSectionKey,
  MapleCharacterEquipment,
  MapleUserUnion,
  MapleEquipmentItem,
  MapleStatEntry,
  MapleCharacterCashEquipment,
  MapleCashItem,
  MapleCharacterSymbolEquipment,
  MapleCharacterSetEffect,
  MapleCharacterBeautyEquipment,
  MapleCharacterAndroidEquipment,
  MapleCharacterPetEquipment,
  MapleCharacterLinkSkill,
  MapleCharacterVMatrix,
  MapleCharacterHexaMatrix,
  MapleCharacterHexaMatrixStat,
  SkillModuleKey,
} from "@/lib/maplestory";

type QueryVariables = {
  characterName: string;
  date?: string;
  section?: CharacterSectionKey;
  ocid?: string;
  skillModule?: SkillModuleKey;
};

type BasicSectionData = NonNullable<CharacterSectionMap["basic"]>;
type StatSectionData = NonNullable<CharacterSectionMap["stat"]>;
type EquipmentSectionData = NonNullable<CharacterSectionMap["equipment"]>;
type SkillsSectionData = NonNullable<CharacterSectionMap["skills"]>;

async function fetchCharacterDetailsClient({
  characterName,
  date,
  section,
  ocid,
  skillModule,
}: QueryVariables): Promise<CharacterDetailsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("characterName", characterName);
  if (date) {
    searchParams.set("date", date);
  }
  if (section) {
    searchParams.set("section", section);
  }
  if (ocid) {
    searchParams.set("ocid", ocid);
  }
  if (skillModule) {
    searchParams.set("skillModule", skillModule);
  }

  const response = await fetch(`/api/maplestory?${searchParams.toString()}`, {
    method: "GET",
  });
  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "查詢失敗，請稍後再試。";
    throw new Error(message);
  }

  return payload as CharacterDetailsResponse;
}

export function PlayerDashboard() {
  const [characterName, setCharacterName] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const [queryVariables, setQueryVariables] = useState<QueryVariables | null>(
    null
  );

  const characterQueryKey = useMemo(
    () =>
      queryVariables
        ? ([
            "characterDetails",
            queryVariables.characterName,
            queryVariables.date ?? null,
          ] as const)
        : null,
    [queryVariables]
  );

  const characterQuery = useQuery<CharacterDetailsResponse>({
    queryKey: characterQueryKey ?? ["characterDetails"],
    queryFn: () => {
      if (!characterQueryKey) {
        throw new Error("缺少查詢條件");
      }
      const [, name, dateValue] = characterQueryKey;
      return fetchCharacterDetailsClient({
        characterName: name,
        date: dateValue ?? undefined,
        section: "basic",
      });
    },
    enabled: Boolean(characterQueryKey),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = characterName.trim();
    if (!trimmedName) {
      setFormError("請輸入角色名稱");
      return;
    }

    setFormError(null);
    const normalizedDate = date.trim() || undefined;
    const newQueryKey = [
      "characterDetails",
      trimmedName,
      normalizedDate ?? null,
    ] as const;

    queryClient.invalidateQueries({ queryKey: newQueryKey });

    setQueryVariables({
      characterName: trimmedName,
      date: normalizedDate,
    });
  }

  const serverError =
    characterQuery.isError && !characterQuery.isFetching
      ? characterQuery.error instanceof Error
        ? characterQuery.error.message
        : "查詢失敗，請稍後再試。"
      : null;

  const errorMessage = formError ?? serverError;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Search className="h-6 w-6 text-primary" />
            冒險島玩家資料中心
          </CardTitle>
          <CardDescription>
            輸入角色名稱並可選擇日期，透過 Nexon Open API 取得角色相關資訊。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px_auto]"
          >
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                角色名稱
              </label>
              <Input
                placeholder="請輸入角色名稱"
                value={characterName}
                onChange={(event) => {
                  setCharacterName(event.target.value);
                  if (formError) {
                    setFormError(null);
                  }
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                查詢日期（選填）
              </label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={characterQuery.isFetching}
              >
                {characterQuery.isFetching && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                查詢
              </Button>
            </div>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">
            提醒：官方 API 每日更新，如遇當天資料不足，可改查詢前一日。
          </p>
        </CardContent>
      </Card>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>查詢失敗</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {characterQuery.isFetching && !characterQuery.data && (
        <SearchLoadingState />
      )}

      {characterQuery.data && (
        <PlayerProfile
          data={characterQuery.data}
          isLoading={characterQuery.isFetching}
        />
      )}

      {!characterQuery.data && !characterQuery.isFetching && !errorMessage && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>立即開始</CardTitle>
            <CardDescription>
              查詢完成後將顯示角色的基本資料、能力值、裝備、技能與冒險家聯盟資訊。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>小提醒：</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>名稱需與遊戲內角色完全一致（含大小寫與空格）。</li>
              <li>若為新角色或改名，資料更新可能略有延遲。</li>
              <li>可透過日期欄位檢視歷史資料。</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchLoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          讀取角色資料中…
        </CardTitle>
        <CardDescription>
          正在向 Nexon Open API 取得最新資訊，請稍候。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl md:col-span-2" />
      </CardContent>
    </Card>
  );
}

interface PlayerProfileProps {
  data: CharacterDetailsResponse;
  isLoading: boolean;
}

const SECTION_ORDER: CharacterSectionKey[] = [
  "basic",
  "stat",
  "equipment",
  "skills",
  "union",
];

const SECTION_META: Record<CharacterSectionKey, { id: string; label: string }> =
  {
    basic: { id: "overview", label: "基本資訊" },
    stat: { id: "stats", label: "能力值" },
    equipment: { id: "equipment", label: "裝備資訊" },
    skills: { id: "skills", label: "技能" },
    union: { id: "union", label: "聯盟" },
  };

function isKnownSectionKey(key: unknown): key is CharacterSectionKey {
  return (
    typeof key === "string" &&
    SECTION_ORDER.includes(key as CharacterSectionKey)
  );
}

function doesErrorBelongToSection(
  errorKey: CharacterSectionKey | string,
  sectionKey: CharacterSectionKey
): boolean {
  if (typeof errorKey === "string") {
    return errorKey === sectionKey || errorKey.startsWith(`${sectionKey}.`);
  }
  return errorKey === sectionKey;
}

function doesErrorBelongToSkillModule(
  errorKey: CharacterSectionKey | string,
  moduleKey: SkillModuleKey
): boolean {
  return typeof errorKey === "string" && errorKey === `skills.${moduleKey}`;
}

function PlayerProfile({ data, isLoading }: PlayerProfileProps) {
  const [sections, setSections] = useState(data.sections);
  const [sectionErrors, setSectionErrors] = useState<
    CharacterDetailsResponse["errors"]
  >(data.errors);
  const [fetchedAt, setFetchedAt] = useState(data.fetchedAt);
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () =>
      [
        "characterDetails",
        data.characterName,
        data.requestedDate ?? null,
      ] as const,
    [data.characterName, data.requestedDate]
  );

  useEffect(() => {
    setSections(data.sections);
    setSectionErrors(data.errors);
    setFetchedAt(data.fetchedAt);
  }, [data]);

  const requestedDate = data.requestedDate;

  const tabs = useMemo(
    () => SECTION_ORDER.map((key) => ({ key, ...SECTION_META[key] })),
    []
  );

  const tabIdToSectionKey = useMemo(() => {
    const map: Record<string, CharacterSectionKey> = {};
    SECTION_ORDER.forEach((key) => {
      map[SECTION_META[key].id] = key;
    });
    return map;
  }, []);

  const [activeTab, setActiveTab] = useState<string>(SECTION_META.basic.id);

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveTab(SECTION_META.basic.id);
      return;
    }

    setActiveTab((current) => {
      if (tabs.some((tab) => tab.id === current)) {
        return current;
      }
      return tabs[0]!.id;
    });
  }, [tabs]);

  const [loadingSections, setLoadingSections] = useState<
    Partial<Record<CharacterSectionKey, boolean>>
  >({});
  const [loadingSkillModules, setLoadingSkillModules] = useState<
    Partial<Record<SkillModuleKey, boolean>>
  >({});

  const setSectionLoading = useCallback(
    (sectionKey: CharacterSectionKey, isLoading: boolean) => {
      setLoadingSections((prev) => {
        const already = Boolean(prev[sectionKey]);
        if (isLoading) {
          if (already) {
            return prev;
          }
          return {
            ...prev,
            [sectionKey]: true,
          };
        }
        if (!already) {
          return prev;
        }
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
    },
    []
  );

  const { mutate: mutateSection } = useMutation({
    mutationFn: fetchCharacterDetailsClient,
    onMutate: (variables) => {
      const sectionKey = variables.section;
      if (sectionKey) {
        setSectionLoading(sectionKey, true);
      }
    },
    onSuccess: (response, variables) => {
      const sectionKey = variables.section;
      if (!sectionKey) {
        return;
      }

      setSections((prev) => ({
        ...prev,
        ...response.sections,
      }));

      setSectionErrors((prev) => {
        const remaining = prev.filter(
          (error) => !doesErrorBelongToSection(error.key, sectionKey)
        );
        const updates = response.errors.filter((error) =>
          doesErrorBelongToSection(error.key, sectionKey)
        );
        return [...remaining, ...updates];
      });

      setFetchedAt(response.fetchedAt);

      queryClient.setQueryData<CharacterDetailsResponse>(queryKey, (cached) => {
        if (!cached) {
          return response;
        }

        const cachedRemaining = cached.errors.filter(
          (error) => !doesErrorBelongToSection(error.key, sectionKey)
        );
        const cachedUpdates = response.errors.filter((error) =>
          doesErrorBelongToSection(error.key, sectionKey)
        );

        return {
          ...cached,
          sections: {
            ...cached.sections,
            ...response.sections,
          },
          errors: [...cachedRemaining, ...cachedUpdates],
          fetchedAt: response.fetchedAt,
        };
      });
    },
    onError: (error, variables) => {
      const sectionKey = variables.section;
      if (!sectionKey) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "重新整理失敗，請稍後重試。";

      setSectionErrors((prev) => {
        const remaining = prev.filter(
          (existing) => !doesErrorBelongToSection(existing.key, sectionKey)
        );
        return [...remaining, { key: sectionKey, message }];
      });

      queryClient.setQueryData<CharacterDetailsResponse>(queryKey, (cached) => {
        if (!cached) {
          return cached;
        }

        const cachedRemaining = cached.errors.filter(
          (existing) => !doesErrorBelongToSection(existing.key, sectionKey)
        );

        return {
          ...cached,
          errors: [...cachedRemaining, { key: sectionKey, message }],
        };
      });
    },
    onSettled: (_result, _error, variables) => {
      const sectionKey = variables?.section;
      if (sectionKey) {
        setSectionLoading(sectionKey, false);
      }
    },
  });

  const { mutate: mutateSkillModule } = useMutation<
    CharacterDetailsResponse,
    unknown,
    SkillModuleKey
  >({
    mutationFn: (moduleKey) =>
      fetchCharacterDetailsClient({
        characterName: data.characterName,
        date: requestedDate,
        section: "skills",
        ocid: data.ocid,
        skillModule: moduleKey,
      }),
    onMutate: (moduleKey) => {
      setLoadingSkillModules((prev) => {
        if (prev[moduleKey]) {
          return prev;
        }
        return {
          ...prev,
          [moduleKey]: true,
        };
      });
    },
    onSuccess: (response, moduleKey) => {
      const skillData = (response.sections.skills ?? {}) as SkillsSectionData;

      setSections((prev) => {
        const prevSkills = (prev.skills ?? {}) as SkillsSectionData;
        return {
          ...prev,
          skills: {
            ...prevSkills,
            ...skillData,
          },
        };
      });

      setSectionErrors((prev) => {
        const remaining = prev.filter(
          (error) =>
            !doesErrorBelongToSkillModule(error.key, moduleKey) &&
            error.key !== "skills"
        );
        const updates = response.errors.filter((error) =>
          doesErrorBelongToSkillModule(error.key, moduleKey)
        );
        return [...remaining, ...updates];
      });

      setFetchedAt(response.fetchedAt);

      queryClient.setQueryData<CharacterDetailsResponse>(queryKey, (cached) => {
        if (!cached) {
          return response;
        }

        const cachedSkills = (cached.sections.skills ??
          {}) as SkillsSectionData;

        const updatedErrors = (() => {
          const remaining = cached.errors.filter(
            (error) =>
              !doesErrorBelongToSkillModule(error.key, moduleKey) &&
              error.key !== "skills"
          );
          const updates = response.errors.filter((error) =>
            doesErrorBelongToSkillModule(error.key, moduleKey)
          );
          return [...remaining, ...updates];
        })();

        return {
          ...cached,
          sections: {
            ...cached.sections,
            skills: {
              ...cachedSkills,
              ...skillData,
            },
          },
          errors: updatedErrors,
          fetchedAt: response.fetchedAt,
        };
      });
    },
    onError: (error, moduleKey) => {
      const message =
        error instanceof Error ? error.message : "重新整理失敗，請稍後重試。";
      setSectionErrors((prev) => {
        const remaining = prev.filter(
          (existing) => !doesErrorBelongToSkillModule(existing.key, moduleKey)
        );
        return [...remaining, { key: `skills.${moduleKey}`, message }];
      });
    },
    onSettled: (_result, _error, moduleKey) => {
      setLoadingSkillModules((prev) => {
        if (!prev[moduleKey]) {
          return prev;
        }
        const next = { ...prev };
        delete next[moduleKey];
        return next;
      });
    },
  });

  const resolvedErrors = useMemo(() => {
    const record: Record<string, string> = {};
    sectionErrors.forEach((error) => {
      const key =
        typeof error.key === "string" ? error.key : (error.key as string);
      record[key] = error.message;
    });
    return record;
  }, [sectionErrors]);

  const triggerSectionRetry = useCallback(
    (sectionKey: CharacterSectionKey) => {
      mutateSection({
        characterName: data.characterName,
        date: requestedDate,
        section: sectionKey,
        ocid: data.ocid,
      });
    },
    [data.characterName, mutateSection, requestedDate, data.ocid]
  );

  useEffect(() => {
    const sectionKey = tabIdToSectionKey[activeTab];
    if (!sectionKey || sectionKey === "basic") {
      return;
    }

    const hasData = Boolean(sections[sectionKey]);
    const hasError =
      Boolean(resolvedErrors[sectionKey]) ||
      Object.keys(resolvedErrors).some((errorKey) =>
        errorKey.startsWith(`${sectionKey}.`)
      );
    const isLoading = Boolean(loadingSections[sectionKey]);

    if (!hasData && !hasError && !isLoading) {
      triggerSectionRetry(sectionKey);
    }
  }, [
    activeTab,
    tabIdToSectionKey,
    sections,
    resolvedErrors,
    loadingSections,
    triggerSectionRetry,
  ]);

  function renderSectionContent(sectionKey: CharacterSectionKey) {
    const errorMessage = resolvedErrors[sectionKey];
    const isRetrying = Boolean(loadingSections[sectionKey]);
    const sectionData = sections[sectionKey];

    const hasAnyErrorForSection =
      Boolean(errorMessage) ||
      Object.keys(resolvedErrors).some((key) =>
        key.startsWith(`${sectionKey}.`)
      );

    return (
      <div className="space-y-4">
        {errorMessage && (
          <SectionRetryBanner
            message={errorMessage}
            onRetry={() => triggerSectionRetry(sectionKey)}
            isRetrying={isRetrying}
          />
        )}

        {isRetrying && !sectionData ? (
          <SectionLoadingState />
        ) : sectionData ? (
          <SectionBody
            sectionKey={sectionKey}
            sections={sections}
            errors={resolvedErrors}
            onRetry={() => triggerSectionRetry(sectionKey)}
            isLoading={isRetrying}
            loadingSkillModules={loadingSkillModules}
            onRefetchSkillModule={mutateSkillModule}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasAnyErrorForSection
              ? "資料讀取暫時失敗，請稍後再試。"
              : "目前沒有資料可以顯示。"}
          </p>
        )}
      </div>
    );
  }

  const basicProfile = sections.basic?.profile;

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
            <UserCircle2 className="h-6 w-6 text-primary" />
            {basicProfile?.character_name ?? data.characterName}
          </CardTitle>
          <CardDescription className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
            <span>
              {basicProfile?.world_name ?? "未知伺服器"} ｜{" "}
              {basicProfile?.character_class ?? "未知職業"}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              查詢時間：{new Date(fetchedAt).toLocaleString("zh-TW")}
              {requestedDate ? `（資料日期：${requestedDate}）` : ""}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 sm:text-xs">
          <span className="break-all font-mono">OCID：{data.ocid}</span>
          {basicProfile?.date && (
            <span className="font-mono">基礎資料時間：{basicProfile.date}</span>
          )}
        </CardContent>
      </Card>

      {tabs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            {isLoading ? "資料載入中…" : "沒有可顯示的資料，請稍後再試。"}
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="min-w-max gap-2 sm:min-w-0 sm:w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardContent className="pt-6">
                  {renderSectionContent(tab.key)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
}

function SectionRetryBanner({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Alert variant="warning">
      <ShieldQuestion className="h-4 w-4" />
      <AlertTitle>區塊載入失敗</AlertTitle>
      <AlertDescription className="space-y-3 text-foreground">
        <p>{message}</p>
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-2"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          重新整理
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function SectionLoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      資料載入中…
    </div>
  );
}

function SectionBody({
  sectionKey,
  sections,
  errors,
  onRetry,
  isLoading,
  loadingSkillModules,
  onRefetchSkillModule,
}: {
  sectionKey: CharacterSectionKey;
  sections: CharacterSectionMap;
  errors: Record<string, string>;
  onRetry: () => void;
  isLoading: boolean;
  loadingSkillModules?: Partial<Record<SkillModuleKey, boolean>>;
  onRefetchSkillModule?: (module: SkillModuleKey) => void;
}) {
  switch (sectionKey) {
    case "basic":
      if (sections.basic) {
        return <OverviewSection section={sections.basic as BasicSectionData} />;
      }
      break;
    case "stat":
      if (sections.stat) {
        return <StatsSection section={sections.stat as StatSectionData} />;
      }
      break;
    case "equipment":
      if (sections.equipment) {
        return (
          <EquipmentSection
            section={sections.equipment as EquipmentSectionData}
          />
        );
      }
      break;
    case "skills":
      if (sections.skills) {
        return (
          <SkillsSection
            section={sections.skills as SkillsSectionData}
            errors={errors}
            isLoading={isLoading}
            loadingModules={loadingSkillModules}
            onRefetchModule={onRefetchSkillModule}
          />
        );
      }
      break;
    case "union":
      if (sections.union) {
        return <UnionSection union={sections.union as MapleUserUnion} />;
      }
      break;
  }

  return <p className="text-sm text-muted-foreground">目前沒有資料。</p>;
}

function OverviewSection({ section }: { section: BasicSectionData }) {
  const profile = section.profile;

  if (!profile) {
    return <p className="text-sm text-muted-foreground">暫無基本資料。</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
          {profile.character_image ? (
            <img
              src={profile.character_image}
              alt={`${profile.character_name} 角色圖像`}
              className="h-52 w-auto rounded-lg border border-border bg-background object-contain sm:h-64"
              loading="lazy"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground sm:h-64">
              無角色圖像
            </div>
          )}
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">
              {profile.character_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile.world_name ?? "未知伺服器"} ｜{" "}
              {profile.character_class ?? "未知職業"}
            </p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoTile label="等級" value={profile.character_level} />
          <InfoTile label="經驗值" value={profile.character_exp} />
          <InfoTile label="經驗值比例" value={profile.character_exp_rate} />
          <InfoTile label="所屬公會" value={profile.character_guild_name} />
          <InfoTile label="資料日期" value={profile.date} />
          <InfoTile label="名聲值" value={section.popularity?.popularity} />
        </dl>
      </div>
      {section.dojang && <DojangSection dojang={section.dojang} />}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  const content =
    value === null || value === undefined || value === "" ? "—" : value;

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{content}</p>
    </div>
  );
}

function DojangSection({
  dojang,
}: {
  dojang: NonNullable<BasicSectionData["dojang"]>;
}) {
  const hasHighlights =
    Boolean(dojang.dojang_best_floor) ||
    Boolean(dojang.dojang_best_time) ||
    Boolean(dojang.dojang_best_floor_class_rank) ||
    Boolean(dojang.dojang_best_floor_world_rank);
  const hasRecords = (dojang.dojang_record?.length ?? 0) > 0;

  if (!hasHighlights && !hasRecords) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">武陵道場紀錄</h3>
        {dojang.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{dojang.date}
          </p>
        )}
      </header>
      {hasHighlights && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile label="最高樓層" value={dojang.dojang_best_floor} />
          <InfoTile
            label="最佳時間"
            value={formatDojangTime(dojang.dojang_best_time)}
          />
          <InfoTile
            label="職業排名"
            value={dojang.dojang_best_floor_class_rank}
          />
          <InfoTile
            label="世界排名"
            value={dojang.dojang_best_floor_world_rank}
          />
        </div>
      )}
      {hasRecords && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            歷史紀錄：
          </p>
          <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            {dojang.dojang_record?.slice(0, 6).map((record) => (
              <li
                key={`${record.floor}-${record.time_record}`}
                className="rounded-lg border border-border/70 bg-background/80 px-3 py-2"
              >
                <p className="font-semibold text-foreground">
                  第 {record.floor} 層
                </p>
                <p>
                  {record.time_record_string ??
                    formatDojangTime(record.time_record)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function formatDojangTime(raw?: number) {
  if (raw === null || raw === undefined) {
    return "—";
  }
  const minutes = Math.floor(raw / 60);
  const seconds = Math.abs(Math.round(raw % 60));
  if (minutes === 0 && seconds === 0) {
    return "—";
  }
  return `${minutes}分${seconds.toString().padStart(2, "0")}秒`;
}

function StatsSection({ section }: { section: StatSectionData }) {
  const hasOverview =
    Boolean(section.overview?.final_stat?.length) ||
    Boolean(section.overview?.remain_ap);
  const hasPropensity = Boolean(section.propensity);
  const hasHyperStat =
    Boolean(section.hyperStat?.hyper_stat_preset_1?.length) ||
    Boolean(section.hyperStat?.hyper_stat_preset_2?.length) ||
    Boolean(section.hyperStat?.hyper_stat_preset_3?.length);
  const hasAbility =
    Boolean(section.ability?.ability_info?.length) ||
    Boolean(section.ability?.ability_preset_1?.ability_info?.length) ||
    Boolean(section.ability?.ability_preset_2?.ability_info?.length) ||
    Boolean(section.ability?.ability_preset_3?.ability_info?.length);

  if (!hasOverview && !hasPropensity && !hasHyperStat && !hasAbility) {
    return <p className="text-sm text-muted-foreground">暫無能力資料。</p>;
  }

  return (
    <div className="space-y-8">
      {section.overview && hasOverview && (
        <section className="space-y-4">
          <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              最終能力值
            </h3>
            {section.overview.date && (
              <p className="text-xs text-muted-foreground">
                資料日期：{section.overview.date}
              </p>
            )}
          </header>
          {section.overview.final_stat &&
            section.overview.final_stat.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.overview.final_stat.map((entry) => (
                  <StatCard key={entry.stat_name} entry={entry} />
                ))}
              </div>
            )}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile label="剩餘 AP" value={section.overview.remain_ap} />
            <InfoTile
              label="最小星力"
              value={section.overview.remain_minimum_star_force}
            />
          </div>
        </section>
      )}

      {section.propensity && hasPropensity && (
        <section className="space-y-3">
          <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">生活性向</h3>
            {section.propensity.date && (
              <p className="text-xs text-muted-foreground">
                資料日期：{section.propensity.date}
              </p>
            )}
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoTile
              label="領導力"
              value={section.propensity.charisma_level}
            />
            <InfoTile
              label="感性"
              value={section.propensity.sensibility_level}
            />
            <InfoTile label="洞察力" value={section.propensity.insight_level} />
            <InfoTile
              label="意志"
              value={section.propensity.willingness_level}
            />
            <InfoTile
              label="手藝"
              value={section.propensity.handicraft_level}
            />
            <InfoTile label="魅力" value={section.propensity.charm_level} />
          </div>
        </section>
      )}

      {section.hyperStat && hasHyperStat && (
        <HyperStatSection hyperStat={section.hyperStat} />
      )}

      {section.ability && hasAbility && (
        <AbilitySection ability={section.ability} />
      )}
    </div>
  );
}

function StatCard({ entry }: { entry: MapleStatEntry }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        {entry.stat_name}
      </p>
      <p className="mt-2 text-xl font-semibold text-primary">
        {entry.stat_value}
      </p>
    </div>
  );
}

function HyperStatSection({
  hyperStat,
}: {
  hyperStat: NonNullable<StatSectionData["hyperStat"]>;
}) {
  const presets = [
    {
      id: "1",
      label: "預設 1",
      entries: hyperStat.hyper_stat_preset_1 ?? [],
      remain: hyperStat.hyper_stat_preset_1_remain_point,
    },
    {
      id: "2",
      label: "預設 2",
      entries: hyperStat.hyper_stat_preset_2 ?? [],
      remain: hyperStat.hyper_stat_preset_2_remain_point,
    },
    {
      id: "3",
      label: "預設 3",
      entries: hyperStat.hyper_stat_preset_3 ?? [],
      remain: hyperStat.hyper_stat_preset_3_remain_point,
    },
  ].filter((preset) => preset.entries.length > 0);

  if (presets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">極限屬性</h3>
          <p className="text-xs text-muted-foreground">
            使用預設：{hyperStat.use_preset_no ?? "-"} ｜ 可用點數上限：
            {hyperStat.use_available_hyper_stat ?? "-"}
          </p>
        </div>
        {hyperStat.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{hyperStat.date}
          </p>
        )}
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="rounded-xl border border-border bg-background/80 p-4"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{preset.label}</span>
              {preset.id === hyperStat.use_preset_no && (
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  使用中
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              剩餘點數：{preset.remain ?? 0}
            </p>
            <ul className="mt-3 space-y-1">
              {preset.entries.map((entry) => (
                <li
                  key={`${preset.id}-${entry.stat_type}`}
                  className="flex items-center justify-between rounded border border-border/60 bg-background px-2 py-1 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {entry.stat_type ?? "未知能力"}
                  </span>
                  <span className="text-muted-foreground">
                    Lv.{entry.stat_level ?? "-"} ({entry.stat_point ?? 0} 點)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function AbilitySection({
  ability,
}: {
  ability: NonNullable<StatSectionData["ability"]>;
}) {
  const current = ability.ability_info ?? [];
  const presets = [
    { id: 1, label: "能力預設 1", data: ability.ability_preset_1 },
    { id: 2, label: "能力預設 2", data: ability.ability_preset_2 },
    { id: 3, label: "能力預設 3", data: ability.ability_preset_3 },
  ].filter((preset) => preset.data?.ability_info?.length);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">角色能力</h3>
          <p className="text-xs text-muted-foreground">
            當前階級：{ability.ability_grade ?? "-"} ｜ 套用預設：
            {ability.preset_no ?? "-"}
          </p>
        </div>
        {ability.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{ability.date}
          </p>
        )}
      </header>
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            目前套用
          </p>
          <InfoTile label="剩餘名聲值" value={ability.remain_fame} />
          <ul className="space-y-2 text-xs text-primary-foreground">
            {current.length === 0 ? (
              <li className="text-muted-foreground">尚無能力資訊。</li>
            ) : (
              current.map((entry) => (
                <li
                  key={`${entry.ability_no}-${entry.ability_value}`}
                  className="rounded border border-primary/30 bg-background/30 px-3 py-2"
                >
                  <p className="font-semibold text-primary">
                    {entry.ability_value}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-primary/70">
                    {entry.ability_grade ?? "-"}｜{entry.ability_no ?? "-"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
        {presets.length > 0 && (
          <div className="space-y-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="space-y-2 rounded-xl border border-border bg-background/70 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {preset.label}（{preset.data?.ability_preset_grade ?? "-"}）
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {preset.data?.ability_info?.map((entry) => (
                    <li
                      key={`${preset.id}-${entry.ability_no}-${entry.ability_value}`}
                      className="rounded border border-border/60 bg-background px-3 py-2"
                    >
                      <p className="font-semibold text-foreground">
                        {entry.ability_value}
                      </p>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {entry.ability_grade ?? "-"}｜{entry.ability_no ?? "-"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EquipmentSection({ section }: { section: EquipmentSectionData }) {
  const hasGear = Boolean(section.gear?.item_equipment?.length);
  const hasCash = Boolean(section.cash?.cash_item_equipment_base?.length);
  const hasSymbols = Boolean(section.symbols?.symbol?.length);
  const hasSetEffects = Boolean(section.setEffects?.set_effect?.length);
  const hasBeauty =
    Boolean(section.beauty?.character_hair) ||
    Boolean(section.beauty?.character_face) ||
    Boolean(section.beauty?.character_skin);
  const hasAndroid =
    Boolean(section.android?.android_name) ||
    Boolean(section.android?.android_cash_item_equipment?.length);
  const hasPets =
    Boolean(section.pets?.pet_1_name) ||
    Boolean(section.pets?.pet_2_name) ||
    Boolean(section.pets?.pet_3_name);

  if (
    !hasGear &&
    !hasCash &&
    !hasSymbols &&
    !hasSetEffects &&
    !hasBeauty &&
    !hasAndroid &&
    !hasPets
  ) {
    return <p className="text-sm text-muted-foreground">目前沒有裝備資料。</p>;
  }

  return (
    <div className="space-y-8">
      {section.gear && hasGear && <GearSection gear={section.gear} />}
      {section.cash && hasCash && <CashEquipmentSection cash={section.cash} />}
      {section.symbols && hasSymbols && (
        <SymbolSection symbols={section.symbols} />
      )}
      {section.setEffects && hasSetEffects && (
        <SetEffectSection setEffect={section.setEffects} />
      )}
      {section.beauty && hasBeauty && <BeautySection beauty={section.beauty} />}
      {section.android && hasAndroid && (
        <AndroidSection android={section.android} />
      )}
      {section.pets && hasPets && <PetSection pets={section.pets} />}
    </div>
  );
}

function GearSection({ gear }: { gear: MapleCharacterEquipment }) {
  const items = gear.item_equipment ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">主要裝備</h3>
        {gear.date && (
          <p className="text-xs text-muted-foreground">資料日期：{gear.date}</p>
        )}
      </header>
      {gear.item_title?.title_name && (
        <div className="rounded-xl border border-secondary bg-secondary/40 p-4 text-secondary-foreground">
          <p className="text-xs uppercase tracking-wide">稱號</p>
          <p className="mt-1 text-lg font-semibold">
            {gear.item_title.title_name}
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <EquipmentCard
            key={`${item.slot_name}-${item.item_name}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

function EquipmentCard({ item }: { item: MapleEquipmentItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.slot_name}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {item.item_name}
          </p>
        </div>
        {item.item_icon && (
          <img
            src={item.item_icon}
            alt={item.item_name}
            className="h-12 w-12 rounded border border-border bg-muted object-contain"
            loading="lazy"
          />
        )}
      </div>
      <div className="grid gap-3 text-xs text-muted-foreground">
        {item.starforce !== undefined && (
          <EquipmentStat label="星力" value={`${item.starforce}`} />
        )}
        {item.potential_option_grade && (
          <EquipmentStat label="潛能" value={formatPotential(item)} />
        )}
        {item.additional_potential_option_grade && (
          <EquipmentStat
            label="附加潛能"
            value={formatAdditionalPotential(item)}
          />
        )}
      </div>
    </div>
  );
}

function EquipmentStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-line text-xs text-foreground">{value}</p>
    </div>
  );
}

function CashEquipmentSection({ cash }: { cash: MapleCharacterCashEquipment }) {
  const items = cash.cash_item_equipment_base ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">現金裝備</h3>
        <p className="text-xs text-muted-foreground">
          套用預設：{cash.preset_no ?? "-"}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <CashEquipmentCard
            key={`${item.cash_item_equipment_slot}-${item.cash_item_name}-${index}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

function CashEquipmentCard({ item }: { item: MapleCashItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.cash_item_equipment_part}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {item.cash_item_name}
          </p>
        </div>
        {item.cash_item_icon && (
          <img
            src={item.cash_item_icon}
            alt={item.cash_item_name}
            className="h-12 w-12 rounded border border-border bg-muted object-contain"
            loading="lazy"
          />
        )}
      </div>
      {item.cash_item_option && item.cash_item_option.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {item.cash_item_option.map((option, optionIndex) => (
            <li key={`${item.cash_item_name}-opt-${optionIndex}`}>
              {option.option_type}：{option.option_value}
            </li>
          ))}
        </ul>
      )}
      {item.date_expire && (
        <p className="text-[11px] text-muted-foreground">
          到期日：{item.date_expire}
        </p>
      )}
    </div>
  );
}

function SymbolSection({
  symbols,
}: {
  symbols: MapleCharacterSymbolEquipment;
}) {
  const entries = symbols.symbol ?? [];

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">符文</h3>
        {symbols.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{symbols.date}
          </p>
        )}
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((symbol) => (
          <div
            key={symbol.symbol_name}
            className="space-y-2 rounded-xl border border-border bg-background/80 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {symbol.symbol_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Lv. {symbol.symbol_level ?? "-"} ｜ 成長值{" "}
                  {symbol.symbol_growth_count ?? 0}/
                  {symbol.symbol_require_growth_count ?? 0}
                </p>
              </div>
              {symbol.symbol_icon && (
                <img
                  src={symbol.symbol_icon}
                  alt={symbol.symbol_name}
                  className="h-10 w-10 rounded border border-border bg-muted object-contain"
                  loading="lazy"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {symbol.symbol_description ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SetEffectSection({
  setEffect,
}: {
  setEffect: MapleCharacterSetEffect;
}) {
  const sets = setEffect.set_effect ?? [];

  if (sets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">套裝效果</h3>
        {setEffect.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{setEffect.date}
          </p>
        )}
      </header>
      <div className="space-y-3">
        {sets.map((set) => (
          <div
            key={set.set_name}
            className="space-y-2 rounded-xl border border-border bg-background/70 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {set.set_name}
              </p>
              <span className="text-xs text-muted-foreground">
                積累件數：{set.total_set_count ?? 0}
              </span>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {set.set_effect_info?.map((info, index) => (
                <li key={`${set.set_name}-active-${index}`}>
                  {info.set_count} 件：{info.set_option}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeautySection({ beauty }: { beauty: MapleCharacterBeautyEquipment }) {
  const hasData =
    Boolean(beauty.character_hair) ||
    Boolean(beauty.character_face) ||
    Boolean(beauty.character_skin);

  if (!hasData) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">外觀資訊</h3>
        {beauty.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{beauty.date}
          </p>
        )}
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoTile
          label="髮型"
          value={beauty.character_hair?.hair_name ?? "—"}
        />
        <InfoTile
          label="臉型"
          value={beauty.character_face?.face_name ?? "—"}
        />
        <InfoTile
          label="膚色"
          value={beauty.character_skin?.skin_name ?? "—"}
        />
      </div>
    </section>
  );
}

function AndroidSection({
  android,
}: {
  android: MapleCharacterAndroidEquipment;
}) {
  const items = android.android_cash_item_equipment ?? [];

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">機器人</h3>
          <p className="text-sm text-muted-foreground">
            {android.android_name ?? "未命名"}
            {android.android_nickname ? `（${android.android_nickname}）` : ""}
          </p>
        </div>
        {android.date && (
          <p className="text-xs text-muted-foreground">
            資料日期：{android.date}
          </p>
        )}
      </header>
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.cash_item_equipment_slot}-${index}`}
              className="space-y-2 rounded-xl border border-border bg-background/80 p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {item.cash_item_name}
              </p>
              {item.cash_item_option && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {item.cash_item_option.map((option, optIndex) => (
                    <li key={`${item.cash_item_name}-opt-${optIndex}`}>
                      {option.option_type}：{option.option_value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PetSection({ pets }: { pets: MapleCharacterPetEquipment }) {
  const entries = [
    {
      name: pets.pet_1_name,
      nickname: pets.pet_1_nickname,
      icon: pets.pet_1_icon,
      description: pets.pet_1_description,
      skills: pets.pet_1_skill,
      expire: pets.pet_1_date_expire,
    },
    {
      name: pets.pet_2_name,
      nickname: pets.pet_2_nickname,
      icon: pets.pet_2_icon,
      description: pets.pet_2_description,
      skills: pets.pet_2_skill,
      expire: pets.pet_2_date_expire,
    },
    {
      name: pets.pet_3_name,
      nickname: pets.pet_3_nickname,
      icon: pets.pet_3_icon,
      description: pets.pet_3_description,
      skills: pets.pet_3_skill,
      expire: pets.pet_3_date_expire,
    },
  ].filter((pet) => pet.name);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">寵物資訊</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((pet, index) => (
          <div
            key={`${pet.name}-${index}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-4"
          >
            <div className="flex items-start gap-3">
              {pet.icon && (
                <img
                  src={pet.icon}
                  alt={pet.name ?? ""}
                  className="h-12 w-12 rounded border border-border bg-muted object-contain"
                  loading="lazy"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {pet.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pet.nickname ?? "—"}
                </p>
              </div>
            </div>
            {pet.description && (
              <p className="text-xs text-muted-foreground">{pet.description}</p>
            )}
            {pet.expire && (
              <p className="text-[11px] text-muted-foreground">
                到期日：{pet.expire}
              </p>
            )}
            {pet.skills && pet.skills.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {pet.skills.map((skill) => (
                  <li key={`${pet.name}-${skill}`}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsSection({
  section,
  errors,
  isLoading,
  loadingModules,
  onRefetchModule,
}: {
  section: SkillsSectionData;
  errors: Record<string, string>;
  isLoading: boolean;
  loadingModules?: Partial<Record<SkillModuleKey, boolean>>;
  onRefetchModule?: (module: SkillModuleKey) => void;
}) {
  const moduleErrors = {
    linkSkills: errors["skills.linkSkills"],
    vmatrix: errors["skills.vmatrix"],
    hexamatrix: errors["skills.hexamatrix"],
    hexamatrixStat: errors["skills.hexamatrixStat"],
  };

  const getModuleLoading = (module: SkillModuleKey, hasData: boolean) =>
    Boolean(loadingModules?.[module]) || (isLoading && !hasData);

  const handleRefetch =
    onRefetchModule !== undefined
      ? (module: SkillModuleKey) => onRefetchModule(module)
      : undefined;

  const linkSkillsLoading = getModuleLoading(
    "linkSkills",
    Boolean(section.linkSkills?.character_link_skill?.length)
  );
  const vmatrixLoading = getModuleLoading(
    "vmatrix",
    Boolean(
      section.vmatrix?.character_v_core_equipment?.length ||
        section.vmatrix?.character_v_matrix_core?.length
    )
  );
  const hexamatrixLoading = getModuleLoading(
    "hexamatrix",
    Boolean(section.hexamatrix?.character_hexa_core_equipment?.length)
  );
  const hexamatrixStatLoading = getModuleLoading(
    "hexamatrixStat",
    Boolean(section.hexamatrixStat?.character_hexa_stat_core?.length)
  );

  return (
    <div className="space-y-8">
      <LinkSkillSection
        linkSkills={section.linkSkills ?? null}
        errorMessage={moduleErrors.linkSkills}
        onRefetch={
          handleRefetch ? () => handleRefetch("linkSkills") : undefined
        }
        isModuleLoading={linkSkillsLoading}
      />
      <VMatrixSection
        vmatrix={section.vmatrix ?? null}
        errorMessage={moduleErrors.vmatrix}
        onRefetch={handleRefetch ? () => handleRefetch("vmatrix") : undefined}
        isModuleLoading={vmatrixLoading}
      />
      <HexaMatrixSection
        hexamatrix={section.hexamatrix ?? null}
        errorMessage={moduleErrors.hexamatrix}
        onRefetch={
          handleRefetch ? () => handleRefetch("hexamatrix") : undefined
        }
        isModuleLoading={hexamatrixLoading}
      />
      <HexaStatSection
        hexamatrixStat={section.hexamatrixStat ?? null}
        errorMessage={moduleErrors.hexamatrixStat}
        onRefetch={
          handleRefetch ? () => handleRefetch("hexamatrixStat") : undefined
        }
        isModuleLoading={hexamatrixStatLoading}
      />
    </div>
  );
}

function LinkSkillSection({
  linkSkills,
  errorMessage,
  onRefetch,
  isModuleLoading,
}: {
  linkSkills: MapleCharacterLinkSkill | null;
  errorMessage?: string;
  onRefetch?: () => void;
  isModuleLoading: boolean;
}) {
  const entries = linkSkills?.character_link_skill ?? [];

  if (!errorMessage && entries.length === 0 && !isModuleLoading) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">連結技能</h3>
          {linkSkills?.date && (
            <p className="text-xs text-muted-foreground">
              資料日期：{linkSkills.date}
            </p>
          )}
        </div>
        {onRefetch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefetch}
            disabled={isModuleLoading}
            aria-label="重新整理連結技能"
          >
            {isModuleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        )}
      </header>
      {errorMessage && (
        <SectionRetryBanner
          message={errorMessage}
          onRetry={onRefetch ?? (() => {})}
          isRetrying={isModuleLoading}
        />
      )}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isModuleLoading ? "資料載入中…" : "目前沒有連結技能資料。"}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((skill) => (
            <article
              key={`${skill.skill_name}-${skill.skill_level}`}
              className="flex gap-3 rounded-xl border border-border bg-background/90 p-4"
            >
              {skill.skill_icon && (
                <img
                  src={skill.skill_icon}
                  alt={skill.skill_name}
                  className="h-12 w-12 flex-shrink-0 rounded border border-border bg-muted object-contain"
                  loading="lazy"
                />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {skill.skill_name}
                </p>
                <p className="text-xs text-primary">
                  Lv. {skill.skill_level ?? "-"}
                </p>
                {skill.skill_effect && (
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {skill.skill_effect}
                  </p>
                )}
                {!skill.skill_effect && skill.skill_description && (
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {skill.skill_description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function VMatrixSection({
  vmatrix,
  errorMessage,
  onRefetch,
  isModuleLoading,
}: {
  vmatrix: MapleCharacterVMatrix | null;
  errorMessage?: string;
  onRefetch?: () => void;
  isModuleLoading: boolean;
}) {
  const slots = vmatrix?.character_v_core_equipment ?? [];
  const cores = vmatrix?.character_v_matrix_core ?? [];
  const remainingSlotPoints =
    vmatrix?.character_v_matrix_remain_slot_upgrade_point;

  if (
    !errorMessage &&
    slots.length === 0 &&
    cores.length === 0 &&
    !isModuleLoading
  ) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">V 矩陣</h3>
          {vmatrix?.date && (
            <p className="text-xs text-muted-foreground">
              資料日期：{vmatrix.date}
            </p>
          )}
          {typeof remainingSlotPoints === "number" && (
            <p className="text-xs text-muted-foreground">
              剩餘欄位強化點數：{remainingSlotPoints}
            </p>
          )}
        </div>
        {onRefetch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefetch}
            disabled={isModuleLoading}
            aria-label="重新整理 V 矩陣"
          >
            {isModuleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        )}
      </header>
      {errorMessage && (
        <SectionRetryBanner
          message={errorMessage}
          onRetry={onRefetch ?? (() => {})}
          isRetrying={isModuleLoading}
        />
      )}
      {slots.length === 0 && cores.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isModuleLoading ? "資料載入中…" : "目前沒有 V 矩陣資料。"}
        </p>
      ) : (
        <>
          {slots.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                核心欄位
              </p>
              <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot, index) => {
                  const enhancedSkills = [
                    slot.v_core_skill_1,
                    slot.v_core_skill_2,
                    slot.v_core_skill_3,
                  ].filter(
                    (skill): skill is string => Boolean(skill && skill.trim())
                  );

                  return (
                    <li
                      key={`vmatrix-slot-${slot.slot_id ?? slot.v_core_name ?? slot.slot_core_name ?? index}`}
                      className="rounded border border-border/60 bg-background px-3 py-2"
                    >
                      <p className="font-semibold text-foreground">
                        {slot.v_core_name ?? slot.slot_core_name ?? "未設定"}
                      </p>
                      <p>
                        核心等級：{slot.v_core_level ?? "-"} ｜ 欄位等級：
                        {slot.slot_level ?? "-"}
                      </p>
                      <p>
                        類型：{slot.v_core_type ?? slot.slot_type ?? "-"} ｜ 欄位
                        ID：{slot.slot_id ?? "-"}
                      </p>
                      {enhancedSkills.length > 0 && (
                        <p>
                          強化技能：
                          {enhancedSkills.join(" ‧ ")}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {cores.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                核心清單
              </p>
              <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                {cores.map((core) => (
                  <li
                    key={`${core.core_name}-${core.core_level}`}
                    className="rounded border border-border/60 bg-background px-3 py-2"
                  >
                    <p className="font-semibold text-foreground">
                      {core.core_name}
                    </p>
                    <p>等級：{core.core_level ?? "-"}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function HexaMatrixSection({
  hexamatrix,
  errorMessage,
  onRefetch,
  isModuleLoading,
}: {
  hexamatrix: MapleCharacterHexaMatrix | null;
  errorMessage?: string;
  onRefetch?: () => void;
  isModuleLoading: boolean;
}) {
  const cores = hexamatrix?.character_hexa_core_equipment ?? [];
  console.log("cores", cores);

  if (!errorMessage && cores.length === 0 && !isModuleLoading) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">HEXA 核心</h3>
          {hexamatrix?.date && (
            <p className="text-xs text-muted-foreground">
              資料日期：{hexamatrix.date}
            </p>
          )}
        </div>
        {onRefetch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefetch}
            disabled={isModuleLoading}
            aria-label="重新整理 HEXA 核心"
          >
            {isModuleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        )}
      </header>
      {errorMessage && (
        <SectionRetryBanner
          message={errorMessage}
          onRetry={onRefetch ?? (() => {})}
          isRetrying={isModuleLoading}
        />
      )}
      {cores.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isModuleLoading ? "資料載入中…" : "目前沒有 HEXA 核心資料。"}
        </p>
      ) : (
        <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          {cores.map((core) => (
            <li
              key={`${core.hexa_core_name ?? "unknown"}-${
                core.hexa_core_level ?? "unknown"
              }`}
              className="rounded border border-border/60 bg-background px-3 py-2"
            >
              <p className="font-semibold text-foreground">
                {core.hexa_core_name ?? "未設定"}
              </p>
              <p>
                等級：{core.hexa_core_level ?? "-"} ｜ 類型：
                {core.hexa_core_type ?? "-"}
              </p>
              {core.linked_skill?.length ? (
                <p>
                  連結技能：
                  {core.linked_skill
                    .map((skill) => skill.hexa_skill_id ?? "-")
                    .join("、")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HexaStatSection({
  hexamatrixStat,
  errorMessage,
  onRefetch,
  isModuleLoading,
}: {
  hexamatrixStat: MapleCharacterHexaMatrixStat | null;
  errorMessage?: string;
  onRefetch?: () => void;
  isModuleLoading: boolean;
}) {
  const statGroups = [
    {
      label: "核心屬性 1",
      entries: hexamatrixStat?.character_hexa_stat_core ?? [],
    },
    {
      label: "核心屬性 2",
      entries: hexamatrixStat?.character_hexa_stat_core_2 ?? [],
    },
    {
      label: "核心屬性 3",
      entries: hexamatrixStat?.character_hexa_stat_core_3 ?? [],
    },
    {
      label: "預設 1",
      entries: hexamatrixStat?.preset_hexa_stat_core ?? [],
    },
    {
      label: "預設 2",
      entries: hexamatrixStat?.preset_hexa_stat_core_2 ?? [],
    },
    {
      label: "預設 3",
      entries: hexamatrixStat?.preset_hexa_stat_core_3 ?? [],
    },
  ].filter((group) => group.entries.length > 0);

  const hasStats = statGroups.length > 0;

  if (!errorMessage && !hasStats && !isModuleLoading) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">HEXA 屬性</h3>
          {hexamatrixStat?.date && (
            <p className="text-xs text-muted-foreground">
              資料日期：{hexamatrixStat.date}
            </p>
          )}
        </div>
        {onRefetch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefetch}
            disabled={isModuleLoading}
            aria-label="重新整理 HEXA 屬性"
          >
            {isModuleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        )}
      </header>
      {errorMessage && (
        <SectionRetryBanner
          message={errorMessage}
          onRetry={onRefetch ?? (() => {})}
          isRetrying={isModuleLoading}
        />
      )}
      {!hasStats ? (
        <p className="text-sm text-muted-foreground">
          {isModuleLoading ? "資料載入中…" : "目前沒有 HEXA 屬性資料。"}
        </p>
      ) : (
        <div className="space-y-4">
          {statGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                {group.label}
              </h4>
              <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((entry, index) => {
                  const keyParts = [
                    entry.slot_id,
                    entry.main_stat_name,
                    entry.main_stat_level,
                  ]
                    .filter(Boolean)
                    .join("-");

                  const entryKey =
                    keyParts.length > 0
                      ? `${group.label}-${keyParts}`
                      : `${group.label}-${index}`;

                  return (
                    <li
                      key={entryKey}
                      className="rounded border border-border/60 bg-background px-3 py-2"
                    >
                      <p className="font-semibold text-foreground">
                        {entry.main_stat_name ?? "-"}
                      </p>
                      <p>槽位：{entry.slot_id ?? "-"}</p>
                      <p>
                        主屬性等級：
                        {entry.main_stat_level ?? "-"}
                      </p>
                      <p>
                        {entry.sub_stat_name_1 ?? "副屬性 1"}：等級{" "}
                        {entry.sub_stat_level_1 ?? "-"}
                      </p>
                      <p>
                        {entry.sub_stat_name_2 ?? "副屬性 2"}：等級{" "}
                        {entry.sub_stat_level_2 ?? "-"}
                      </p>
                      <p>評級：{entry.stat_grade ?? "-"}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatPotential(item: MapleEquipmentItem): string {
  const options = [
    item.potential_option_1,
    item.potential_option_2,
    item.potential_option_3,
  ].filter(Boolean);

  if (options.length === 0) {
    return item.potential_option_grade ?? "—";
  }

  return [`${item.potential_option_grade ?? "潛能"}`, ...options].join("\n");
}

function formatAdditionalPotential(item: MapleEquipmentItem): string {
  const options = [
    item.additional_potential_option_1,
    item.additional_potential_option_2,
    item.additional_potential_option_3,
  ].filter(Boolean);

  if (options.length === 0) {
    return item.additional_potential_option_grade ?? "—";
  }

  return [
    `${item.additional_potential_option_grade ?? "附加潛能"}`,
    ...options,
  ].join("\n");
}

function UnionSection({ union }: { union: MapleUserUnion }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoTile label="聯盟等級" value={union.union_level} />
      <InfoTile label="聯盟階級" value={union.union_grade} />
      <InfoTile label="持有的神器點數" value={union.union_artifact_point} />
      <InfoTile label="神器等級" value={union.union_artifact_level} />
      <InfoTile label="神器經驗值" value={union.union_artifact_exp} />
      <InfoTile label="資料日期" value={union.date} />
    </div>
  );
}
