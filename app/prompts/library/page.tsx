import { PROMPT_CATEGORIES } from '@/features/prompts/schemas';
import type { PromptFilters } from '@/features/prompts/services';
import { PromptsContent } from './PromptsContent';

const isPromptCategory = (value: string): value is (typeof PROMPT_CATEGORIES)[number] => {
    return PROMPT_CATEGORIES.includes(value as (typeof PROMPT_CATEGORIES)[number]);
};

const parseFilters = (searchParams: Record<string, string | string[] | undefined>): PromptFilters => {
    const tagsParam = searchParams.tags;
    const tagsArray = Array.isArray(tagsParam)
        ? tagsParam.flatMap((value) =>
            String(value)
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
        )
        : typeof tagsParam === 'string'
            ? tagsParam.split(',').map((tag) => tag.trim()).filter(Boolean)
            : [];

    return {
        q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
        category:
            typeof searchParams.category === 'string' && isPromptCategory(searchParams.category)
                ? searchParams.category
                : undefined,
        tags: tagsArray,
        favoritesOnly: searchParams.favorites === 'true',
        sort:
            searchParams.sort === 'usage' ||
                searchParams.sort === 'az' ||
                searchParams.sort === 'favorites'
                ? searchParams.sort
                : 'recent',
        page: Number(searchParams.page ?? '1') || 1
    } satisfies PromptFilters;
};

export default async function LibraryPage({
    searchParams
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedParams = await searchParams;
    const filters = parseFilters(resolvedParams);
    return <PromptsContent filters={filters} searchParams={resolvedParams} />;
}
