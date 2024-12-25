"use client";
import { Button } from "@/components/ui/button";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";

const SelectedFilter = ({ activeFilters, categories, handleFilter, setShowFilterDialog }) => {
  return (
    <>
      <div className="flex gap-2">
        {/* Selected Categories Indicator */}
      {activeFilters.categories?.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              if (activeFilters.categories.includes(category.id.toString())) {
                return (
                  <div key={category.id} className="inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 px-3 rounded-full bg-black text-white hover:bg-black/90 flex items-center gap-2"
                      onClick={() => {
                        // Remove this category from the filter
                        handleFilter({
                          ...activeFilters,
                          categories: activeFilters.categories.filter(
                            id => id !== category.id.toString()
                          ),
                        });
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
        </div>
      )}

      {/* Date Range Indicator */}
      {(activeFilters.dateRange?.from || activeFilters.dateRange?.to) && (
        <div className="mb-2">
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] h-7 px-3 rounded-full bg-black text-white hover:bg-black/90 flex items-center gap-2"
            onClick={() => {
              handleFilter({
                ...activeFilters,
                dateRange: { from: undefined, to: undefined },
              });
            }}
          >
            <Calendar className="h-3 w-3" />
            {activeFilters.dateRange.from && activeFilters.dateRange.to ? (
              `${format(new Date(activeFilters.dateRange.from), "MMM d")} - ${format(
                new Date(activeFilters.dateRange.to),
                "MMM d, yyyy"
              )}`
            ) : activeFilters.dateRange.from ? (
              `From ${format(new Date(activeFilters.dateRange.from), "MMM d, yyyy")}`
            ) : (
              `Until ${format(new Date(activeFilters.dateRange.to), "MMM d, yyyy")}`
            )}
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      </div>
    </>
  );
};

export default SelectedFilter;