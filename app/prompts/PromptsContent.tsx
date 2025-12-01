import { PromptsContent as SharedPromptsContent } from '@/components/shared/PromptsContent';
import { type PromptFilters } from '@/features/prompts/services';

interface Props {
  filters: PromptFilters;
  searchParams: Record<string, string | string[] | undefined>;
}

export const PromptsContent = ({ filters, searchParams }: Props) => {
  return (
    <SharedPromptsContent 
      filters={filters} 
      searchParams={searchParams} 
      showLibraryAnchor={false} 
    />
  );
};
