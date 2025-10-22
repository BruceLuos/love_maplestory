"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  MapleCharacterBasic,
  MapleCharacterEquipment,
  MapleCharacterSkillSet,
  MapleCharacterStat,
  MapleUserUnion,
  MapleEquipmentItem,
  MapleStatEntry,
} from "@/lib/maplestory";

type QueryVariables = {
  characterName: string;
  date?: string;
  section?: CharacterSectionKey;
  ocid?: string;
};

async function fetchCharacterDetailsClient({
  characterName,
  date,
  section,
  ocid,
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

  const mutation = useMutation({
    mutationFn: fetchCharacterDetailsClient,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = characterName.trim();
    if (!trimmedName) {
      setFormError("請輸入角色名稱");
      return;
    }

    setFormError(null);
    mutation.mutate({
      characterName: trimmedName,
      date: date.trim() || undefined,
    });
  }

  const errorMessage =
    formError ??
    (mutation.isError && !mutation.isPending
      ? (mutation.error as Error).message
      : null);

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
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
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

      {mutation.isPending && <SearchLoadingState />}

      {mutation.data && (
        <PlayerProfile data={mutation.data} isLoading={mutation.isPending} />
      )}

      {!mutation.data && !mutation.isPending && !errorMessage && (
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

function PlayerProfile({ data, isLoading }: PlayerProfileProps) {
  const [sections, setSections] = useState(data.sections);
  const [sectionErrors, setSectionErrors] = useState(data.errors);
  const [fetchedAt, setFetchedAt] = useState(data.fetchedAt);

  useEffect(() => {
    setSections(data.sections);
    setSectionErrors(data.errors);
    setFetchedAt(data.fetchedAt);
  }, [data]);

  const requestedDate = data.requestedDate;

  const tabs = useMemo(() => {
    const presentKeys = new Set<CharacterSectionKey>();

    SECTION_ORDER.forEach((key) => {
      if (sections[key]) {
        presentKeys.add(key);
      }
    });

    sectionErrors.forEach((error) => {
      if (isKnownSectionKey(error.key)) {
        presentKeys.add(error.key);
      }
    });

    return SECTION_ORDER.filter((key) => presentKeys.has(key)).map((key) => ({
      key,
      ...SECTION_META[key],
    }));
  }, [sections, sectionErrors]);

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

  const retrySectionMutation = useMutation({
    mutationFn: fetchCharacterDetailsClient,
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
          (error) => !(isKnownSectionKey(error.key) && error.key === sectionKey)
        );
        const updates = response.errors.filter(
          (error) => isKnownSectionKey(error.key) && error.key === sectionKey
        );
        return [...remaining, ...updates];
      });

      setFetchedAt(response.fetchedAt);
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
          (existing) =>
            !(isKnownSectionKey(existing.key) && existing.key === sectionKey)
        );
        return [...remaining, { key: sectionKey, message }];
      });
    },
  });

  const retryingSection = retrySectionMutation.variables?.section;

  const resolvedErrors = useMemo(() => {
    const record: Partial<Record<CharacterSectionKey, string>> = {};
    sectionErrors.forEach((error) => {
      if (isKnownSectionKey(error.key)) {
        record[error.key] = error.message;
      }
    });
    return record;
  }, [sectionErrors]);

  function triggerSectionRetry(sectionKey: CharacterSectionKey) {
    retrySectionMutation.mutate({
      characterName: data.characterName,
      date: requestedDate,
      section: sectionKey,
      ocid: data.ocid,
    });
  }

  function renderSectionContent(sectionKey: CharacterSectionKey) {
    const errorMessage = resolvedErrors[sectionKey];
    const isRetrying =
      retrySectionMutation.isPending && retryingSection === sectionKey;
    const sectionData = sections[sectionKey];

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
          <SectionBody sectionKey={sectionKey} sections={sections} />
        ) : (
          <p className="text-sm text-muted-foreground">
            目前沒有資料可以顯示。
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
            <UserCircle2 className="h-6 w-6 text-primary" />
            {sections.basic?.character_name ?? data.characterName}
          </CardTitle>
          <CardDescription className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
            <span>
              {sections.basic?.world_name ?? "未知伺服器"} ｜{" "}
              {sections.basic?.character_class ?? "未知職業"}
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
          {sections.basic?.date && (
            <span className="font-mono">
              基礎資料時間：{sections.basic.date}
            </span>
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
      重新整理中…
    </div>
  );
}

function SectionBody({
  sectionKey,
  sections,
}: {
  sectionKey: CharacterSectionKey;
  sections: CharacterSectionMap;
}) {
  switch (sectionKey) {
    case "basic":
      return <OverviewSection basic={sections.basic as MapleCharacterBasic} />;
    case "stat":
      return <StatsSection stat={sections.stat as MapleCharacterStat} />;
    case "equipment":
      return (
        <EquipmentSection
          equipment={sections.equipment as MapleCharacterEquipment}
        />
      );
    case "skills":
      return (
        <SkillsSection
          skillSets={sections.skills as MapleCharacterSkillSet[]}
        />
      );
    case "union":
      return <UnionSection union={sections.union as MapleUserUnion} />;
    default:
      return <p className="text-sm text-muted-foreground">目前沒有資料。</p>;
  }
}

function OverviewSection({ basic }: { basic: MapleCharacterBasic }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
        {basic.character_image ? (
          <img
            src={basic.character_image}
            alt={`${basic.character_name} 角色圖像`}
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
            {basic.character_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {basic.world_name ?? "未知伺服器"} ｜{" "}
            {basic.character_class ?? "未知職業"}
          </p>
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <InfoTile label="等級" value={basic.character_level} />
        <InfoTile label="經驗值" value={basic.character_exp} />
        <InfoTile label="經驗值比例" value={basic.character_exp_rate} />
        <InfoTile label="所屬公會" value={basic.character_guild_name} />
        <InfoTile label="資料日期" value={basic.date} />
      </dl>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/80 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 text-lg font-semibold text-foreground">
        {value ?? "—"}
      </dd>
    </div>
  );
}

function StatsSection({ stat }: { stat: MapleCharacterStat }) {
  if (!stat.final_stat || stat.final_stat.length === 0) {
    return <p className="text-sm text-muted-foreground">暫無能力值資料。</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stat.final_stat.map((entry) => (
          <StatCard key={entry.stat_name} entry={entry} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile label="剩餘 AP" value={stat.remain_ap} />
        <InfoTile label="最小星力" value={stat.remain_minimum_star_force} />
      </div>
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

function EquipmentSection({
  equipment,
}: {
  equipment: MapleCharacterEquipment;
}) {
  const items = equipment.item_equipment ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">目前沒有裝備資料。</p>;
  }

  return (
    <div className="space-y-5">
      {equipment.item_title?.title_name && (
        <div className="rounded-xl border border-secondary bg-secondary/40 p-4 text-secondary-foreground">
          <p className="text-xs uppercase tracking-wide">稱號</p>
          <p className="mt-1 text-lg font-semibold">
            {equipment.item_title.title_name}
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
    </div>
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

function SkillsSection({ skillSets }: { skillSets: MapleCharacterSkillSet[] }) {
  if (!skillSets || skillSets.length === 0) {
    return <p className="text-sm text-muted-foreground">目前沒有技能資料。</p>;
  }

  return (
    <div className="space-y-6">
      {skillSets.map((set) => (
        <SkillGroup key={set.character_skill_grade} skillSet={set} />
      ))}
    </div>
  );
}

function SkillGroup({ skillSet }: { skillSet: MapleCharacterSkillSet }) {
  return (
    <section className="space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {translateSkillGrade(skillSet.character_skill_grade)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {skillSet.character_class}
          </p>
        </div>
        {skillSet.date && (
          <p className="text-xs text-muted-foreground">
            更新時間：{skillSet.date}
          </p>
        )}
      </header>
      {skillSet.character_skill.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          這個階段沒有已學習的技能。
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skillSet.character_skill.map((skill) => (
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

function translateSkillGrade(grade: string): string {
  const mapping: Record<string, string> = {
    "0": "初心者",
    "1": "一轉技能",
    "2": "二轉技能",
    "3": "三轉技能",
    "4": "四轉技能",
    "5": "五轉技能",
    "6": "六轉技能",
    hyperpassive: "超技能力（被動）",
    hyperactive: "超技能力（主動）",
  };

  return mapping[grade] ?? grade;
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
