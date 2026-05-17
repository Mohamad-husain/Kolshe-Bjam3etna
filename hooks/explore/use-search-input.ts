import { useState } from "react";

export function useSearchInput() {
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text.trim() && text.length > 0) {
      setSearchError("لا يمكن البحث بمسافات فارغة");
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
