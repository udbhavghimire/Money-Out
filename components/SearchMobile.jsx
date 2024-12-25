import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function SearchMobile({ activeFilters, categories, handleFilter, searchQuery, setSearchQuery, setShowFilterDialog }) {
  // Get selected category names
  const selectedCategoryNames = activeFilters.categories?.length > 0
    ? categories
        .filter(cat => activeFilters.categories.includes(cat.id.toString()))
        .map(cat => cat.name)
    : null;

  // Format category names for display
  const categoryDisplay = selectedCategoryNames?.length
    ? ` - ${selectedCategoryNames.join(" & ")}`
    : '';

  return (
    <div className="p-5 px-8 md:hidden">
      <div className="">
        <h2 className="text-blue-600 text-base font-semibold mb-2">
          EXPENSE HISTORY{categoryDisplay}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="SEARCH THE RECEIPT"
            className="pl-10 bg-transparent border border-2 border-gray-300/50 rounded-3xl h-9 placeholder:text-gray-500 w-60"
            style={{ fontSize: "12px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}