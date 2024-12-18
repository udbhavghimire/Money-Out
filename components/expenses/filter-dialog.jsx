import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function FilterDialog({ open, onOpenChange, categories, onFilter }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

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
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-auto min-h-[600px] max-h-[90vh] bg-white rounded-lg p-0 md:relative md:inset-auto md:translate-x-0 md:translate-y-0 md:w-full md:max-w-[425px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b text-center">
            <DialogTitle className="text-xl font-semibold">Filter Expenses</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 px-6 py-4">
            <div className="max-w-[280px] mx-auto space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="border rounded-lg p-2">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    className="w-full"
                    classNames={{
                      months: "flex justify-center",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex justify-center",
                      head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-slate-400",
                      row: "flex justify-center mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-slate-800",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      day_selected: "bg-slate-900 text-slate-50 hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900 focus:text-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50 dark:hover:text-slate-900 dark:focus:bg-slate-50 dark:focus:text-slate-900",
                      day_today: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
                      day_outside: "opacity-50",
                      day_disabled: "opacity-50",
                      day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto p-6 border-t">
            <div className="max-w-[280px] mx-auto flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="px-4 py-2 h-10"
              >
                Reset
              </Button>
              <Button 
                onClick={handleFilter}
                className="px-4 py-2 h-10"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 