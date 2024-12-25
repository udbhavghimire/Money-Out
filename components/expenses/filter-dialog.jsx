import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function FilterDialog({ open, onOpenChange, categories, onFilter, activeFilters }) {
  const [selectedCategories, setSelectedCategories] = useState(
    activeFilters?.categories || []
  );
  const [dateRange, setDateRange] = useState({
    from: activeFilters?.dateRange?.from ? new Date(activeFilters.dateRange.from) : null,
    to: activeFilters?.dateRange?.to ? new Date(activeFilters.dateRange.to) : null,
  });

  useEffect(() => {
    setSelectedCategories(activeFilters?.categories || []);
    setDateRange({
      from: activeFilters?.dateRange?.from ? new Date(activeFilters.dateRange.from) : null,
      to: activeFilters?.dateRange?.to ? new Date(activeFilters.dateRange.to) : null,
    });
  }, [activeFilters]);

  useEffect(() => {
    if (!open) {
      setSelectedCategories(activeFilters?.categories || []);
      setDateRange({
        from: activeFilters?.dateRange?.from ? new Date(activeFilters.dateRange.from) : null,
        to: activeFilters?.dateRange?.to ? new Date(activeFilters.dateRange.to) : null,
      });
    }
  }, [open, activeFilters]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
    >
      <span className="flex items-center">
        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
        {value || placeholder}
      </span>
    </button>
  );

  const handleFilter = () => {
    onFilter({
      categories: selectedCategories,
      dateRange: {
        from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      },
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setDateRange({ from: null, to: null });
    onFilter({
      categories: [],
      dateRange: { from: undefined, to: undefined },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-auto max-h-[85vh] bg-white rounded-lg p-0 max-w-[350px]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-center">Filter Expenses</DialogTitle>
        </DialogHeader>

        <div className="py-2 mx-2">
          <div className="space-y-5 text-center">
            <div className="">
              <Label className="text-sm font-medium mb-3 block">
                Select categories
              </Label>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id.toString()) ? "default" : "outline"}
                    onClick={() => handleCategoryToggle(category.id.toString())}
                    size="sm"
                    className={`text-[11px] h-7 px-3 rounded-full ${
                      selectedCategories.includes(category.id.toString())
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
              <Label className="text-sm font-medium mb-2 block">
                Select date range
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker
                    selected={dateRange.from}
                    onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    customInput={<CustomDateInput placeholder="From" />}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="From"
                    isClearable
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    selected={dateRange.to}
                    onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    customInput={<CustomDateInput placeholder="To" />}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="To"
                    isClearable
                    minDate={dateRange.from}
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