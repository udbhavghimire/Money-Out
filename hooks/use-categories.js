import useSWR from "swr";
import axios from "@/lib/axios";

export function useCategories() {
  const { data, error, mutate } = useSWR("/api/categories/", async (url) => {
    const response = await axios.get(url);
    return response.data;
  });

  return {
    categories: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
