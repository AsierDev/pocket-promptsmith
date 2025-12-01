import { PromptFilters as PromptFiltersComponent } from '@/features/prompts/components/PromptFilters';
import { fetchPrompts, fetchUserTags, type PromptFilters } from '@/features/prompts/services';
import { PromptGrid } from '@/features/prompts/components/PromptGrid';
import { PromptEmptyState } from '@/features/prompts/components/PromptEmptyState';

interface Props {
  filters: PromptFilters;
  searchParams: Record<string, string | string[] | undefined>;
  showLibraryAnchor?: boolean;
}

export const PromptsContent = async ({ 
  filters, 
  searchParams, 
  showLibraryAnchor = false 
}: Props) => {
  const [{ prompts, count, pageSize }, suggestedTags] = await Promise.all([
    fetchPrompts(filters),
    fetchUserTags()
  ]);

  const isFavoritesView = Boolean(
    filters.favoritesOnly || filters.sort === 'favorites' || searchParams.favorites === 'true'
  );
  const hasAppliedFilters =
    Boolean(filters.q || filters.category || filters.tags?.length || filters.favoritesOnly) ||
    (filters.sort !== undefined && filters.sort !== 'recent' && filters.sort !== 'favorites') ||
    Boolean(searchParams.tags) ||
    (filters.page !== undefined && filters.page > 1);

  const shouldShowLibraryEmpty = prompts.length === 0 && !isFavoritesView && !hasAppliedFilters;
  const shouldShowFavoritesEmpty = prompts.length === 0 && isFavoritesView;
  const shouldShowFilterEmpty = prompts.length === 0 && !isFavoritesView && hasAppliedFilters;

  return (
    <div className="space-y-6">
      <PromptFiltersComponent initialFilters={filters} suggestedTags={suggestedTags} />
      {showLibraryAnchor && <div id="library-results-anchor" className="scroll-mt-24" />}
      {shouldShowLibraryEmpty && <PromptEmptyState variant="library" />}
      {shouldShowFavoritesEmpty && <PromptEmptyState variant="favorites" />}
      {shouldShowFilterEmpty && <PromptEmptyState variant="filters" />}
      {prompts.length > 0 && (
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