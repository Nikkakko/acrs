import { useQueryState, debounce } from "nuqs";
import { useDebounce } from "./useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";

export function useDebouncedSearch(paramName = "q") {
  const [q, setQ] = useQueryState(paramName, {
    defaultValue: "",
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS),
  });
  const debouncedQ = useDebounce(q ?? "", SEARCH_DEBOUNCE_MS);
  return {
    inputValue: q ?? "",
    setInputValue: setQ,
    debouncedQ,
  };
}
