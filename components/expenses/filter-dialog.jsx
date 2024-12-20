import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function FilterDialog({ open, onOpenChange, categories, onFilter, activeFilters }) {
  const [selectedCategory, setSelectedCategory] = useState(activeFilters?.category || "all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setSelectedCategory(activeFilters?.category || "all");
  }, [activeFilters]);

  useEffect(() => {
    if (!open) {
      setSelectedCategory(activeFilters?.category || "all");
      setDateRange({ from: undefined, to: undefined });
    }
  }, [open, activeFilters]);

  const handleFilter = () => {
    onFilter({
      category: selectedCategory === "all" ? "" : selectedCategory,
      dateRange: {
        from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      },
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedCategory("all");
    setDateRange({ from: undefined, to: undefined });
    onFilter({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-auto max-h-[85vh] bg-white rounded-lg p-0 md:relative md:inset-auto md:translate-x-0 md:translate-y-0 md:w-full max-w-[350px]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-semibold">Filter Expenses</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Category
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    size="sm"
                    className={`text-[11px] h-7 px-3 rounded-full ${
                      selectedCategory === category.id.toString() 
                        ? "bg-black text-white hover:bg-black/90" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-5">
              <Label className="text-sm font-medium mb-3 block">
                Date Range
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">
                    From
                  </label>
                  <Input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 p-4 text-sm"
                    value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                    onChange={(e) => 
                      setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">
                    To
                  </label>
                  <Input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 p-4 text-sm"
                    value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                    onChange={(e) => 
                      setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button 
              onClick={handleFilter}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 