import { PromptFilters as PromptFiltersComponent } from '@/features/prompts/components/PromptFilters';
import { fetchPrompts, fetchUserTags, type PromptFilters } from '@/features/prompts/services';
import { EmptyState } from '@/components/common/EmptyState';
import { PromptGrid } from '@/features/prompts/components/PromptGrid';

interface Props {
  filters: PromptFilters;
  searchParams: Record<string, string | string[] | undefined>;
}

export const PromptsContent = async ({ filters, searchParams }: Props) => {
  const [{ prompts, count, pageSize }, suggestedTags] = await Promise.all([
    fetchPrompts(filters),
    fetchUserTags()
  ]);

  return (
    <div className="space-y-8">
      <PromptFiltersComponent initialFilters={filters} suggestedTags={suggestedTags} />
      {prompts.length === 0 ? (
        <EmptyState
          title="Aún no tienes prompts"
          description="Crea tu primer prompt para empezar a construir tu biblioteca personal."
          actionHref="/prompts/new"
          actionLabel="Crear primer prompt"
        />
      ) : (
        <PromptGrid
          prompts={prompts}
          total={count}
          pageSize={pageSize}
          currentPage={filters.page ?? 1}
          searchParams={searchParams}
        />
      )}
    </div>
  );
};
