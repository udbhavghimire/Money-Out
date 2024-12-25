import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileSpreadsheet, X } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import * as XLSX from 'xlsx';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <Button
    type="button"
    variant="outline"
    className={cn(
      "w-full justify-start text-left font-normal",
      !value && "text-muted-foreground"
    )}
    onClick={onClick}
    ref={ref}
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    {value || <span>{placeholder}</span>}
  </Button>
));

export function ExportDialog({ open, onOpenChange, expenses, categories }) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      // Filter expenses by date range if selected
      let exportExpenses = expenses;
      if (dateRange.from && dateRange.to) {
        exportExpenses = expenses.filter(expense => {
          const expenseDate = parseISO(expense.expense_date);
          return isWithinInterval(expenseDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        });
      }

      // Transform expenses data for export
      const exportData = exportExpenses.map(expense => ({
        Date: format(new Date(expense.expense_date), "yyyy-MM-dd"),
        Description: expense.title,
        Amount: expense.amount,
        Category: expense.category_details?.name || "Uncategorized",
        Receipt: expense.receipt ? "Yes" : "No"
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 40 }, // Description
        { wch: 10 }, // Amount
        { wch: 15 }, // Category
        { wch: 8 },  // Receipt
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Expenses");

      // Generate filename with date range if selected
      let fileName = "expenses";
      if (dateRange.from && dateRange.to) {
        fileName += `_${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`;
      } else {
        fileName += `_${format(new Date(), "yyyy-MM-dd")}`;
      }
      fileName += ".xlsx";

      // Save file
      XLSX.writeFile(wb, fileName);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">Export Expenses</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>

            {/* Date Range Selector */}
            <div className="w-full space-y-2">
              <label className="text-sm font-medium">Date Range (Optional)</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker
                    selected={dateRange.from}
                    onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    customInput={<CustomDateInput placeholder="Start date" />}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="Start date"
                    isClearable
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    selected={dateRange.to}
                    onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    customInput={<CustomDateInput placeholder="End date" />}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="End date"
                    isClearable
                    minDate={dateRange.from}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Export your expenses as an Excel file. 
                {dateRange.from && dateRange.to ? (
                  <span className="block mt-1 text-xs text-blue-600">
                    Exporting expenses from {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span className="block mt-1 text-xs">Select a date range or export all expenses</span>
                )}
              </p>
            </div>

            {/* Export Button */}
            <Button
              className="w-full rounded-full"
              onClick={handleExport}
              disabled={loading || (dateRange.from && !dateRange.to) || (!dateRange.from && dateRange.to)}
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
