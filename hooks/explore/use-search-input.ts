import { useState } from "react";
import { useAppSettings } from "@/contexts/app-settings-context";

export function useSearchInput() {
  const { t } = useAppSettings();
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text.trim() && text.length > 0) {
      setSearchError(t("common.searchWhitespaceError"));
    } else {
      setSearchError("");
    }
  };

  return {
    search,
    searchError,
    handleSearch,
  };
}
