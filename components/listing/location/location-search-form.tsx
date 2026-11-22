'use client';

export function LocationSearchForm({
  basePath,
  placeholder,
  query = '',
  onQueryChange,
  onSubmit,
}: {
  basePath: string;
  placeholder: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <form
      action={basePath}
      method="get"
      className="flex w-full max-w-xl gap-2"
      onSubmit={(event) => {
        if (!onSubmit) return;
        event.preventDefault();
        onSubmit();
      }}>
      <label htmlFor="location-clinic-search" className="sr-only">
        Search clinics
      </label>
      <input
        id="location-clinic-search"
        name="q"
        type="search"
        value={onQueryChange ? query : undefined}
        defaultValue={onQueryChange ? undefined : query}
        onChange={onQueryChange ? (event) => onQueryChange(event.target.value) : undefined}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none ring-blue-500 placeholder:text-gray-400 focus:ring-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:px-5">
        Search
      </button>
    </form>
  );
}
