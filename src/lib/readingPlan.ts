export type ReadingPlanDocument = {
  lastPage: number;
  pageCount: number;
  finished?: boolean;
  targetDate?: number;
};

type PlannedLibraryDocument = ReadingPlanDocument & {
  id: string;
  name: string;
  archived?: boolean;
};

function localDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

export function createReadingTarget(days: number, today = new Date()): number {
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  target.setDate(target.getDate() + Math.max(1, Math.round(days)));
  return target.getTime();
}

export function getReadingPlan(
  document: ReadingPlanDocument,
  today = new Date(),
): { daysRemaining: number; pagesPerDay: number; overdue: boolean; label: string } | null {
  if (document.targetDate == null) return null;
  const target = new Date(document.targetDate);
  if (Number.isNaN(target.getTime())) return null;

  const rawDays = localDayNumber(target) - localDayNumber(today);
  const overdue = rawDays < 0 && !document.finished;
  const daysRemaining = Math.max(1, rawDays);
  const remainingPages = Math.max(0, document.pageCount - document.lastPage);
  const pagesPerDay = document.finished ? 0 : Math.ceil(remainingPages / daysRemaining);
  const due = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const label = document.finished
    ? `Plan complete · ${due}`
    : overdue
      ? `Plan overdue · ${remainingPages} pages left`
      : `${pagesPerDay} page${pagesPerDay === 1 ? '' : 's'}/day · due ${due}`;

  return { daysRemaining, pagesPerDay, overdue, label };
}

export function getTodayReadingPlan(
  documents: PlannedLibraryDocument[],
  today = new Date(),
): {
  documentCount: number;
  pagesToday: number;
  overdueCount: number;
  unknownPaceCount: number;
  nextDocumentId: string;
  nextDocumentName: string;
  nextPages: number;
} | null {
  const planned = documents
    .filter((document) => !document.archived && !document.finished && document.targetDate != null)
    .map((document) => ({ document, plan: getReadingPlan(document, today) }))
    .filter((item): item is { document: PlannedLibraryDocument; plan: NonNullable<ReturnType<typeof getReadingPlan>> } => item.plan != null)
    .sort((a, b) => (a.document.targetDate ?? 0) - (b.document.targetDate ?? 0));
  if (!planned.length) return null;

  return {
    documentCount: planned.length,
    pagesToday: planned.reduce((total, item) => total + item.plan.pagesPerDay, 0),
    overdueCount: planned.filter((item) => item.plan.overdue).length,
    unknownPaceCount: planned.filter((item) => item.document.pageCount <= 0).length,
    nextDocumentId: planned[0].document.id,
    nextDocumentName: planned[0].document.name,
    nextPages: planned[0].plan.pagesPerDay,
  };
}
