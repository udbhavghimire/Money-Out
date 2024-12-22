import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function SearchMobile({ activeFilters, categories, handleFilter, searchQuery, setSearchQuery, setShowFilterDialog }) {
  return (
    <div className="p-5 md:hidden">
      <div className="">
        {/* Selected Category Indicator */}
        {activeFilters.category && (
          <div className="mb-3">
            {categories.map((category) => {
              if (category.id.toString() === activeFilters.category) {
                return (
                  <div key={category.id} className="inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 px-3 rounded-full bg-black text-white hover:bg-black/90 flex items-center gap-2"
                      onClick={() => {
                        // Reset the category filter
                        handleFilter({
                          ...activeFilters,
                          category: "",
                        });
                        // Also reset the selected category in the filter dialog
                        setShowFilterDialog(false);
                      }}
                    >
                      {category.name}
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        <h2 className="text-blue-600 text-base font-semibold mb-2">
          EXPENSE HISTORY
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