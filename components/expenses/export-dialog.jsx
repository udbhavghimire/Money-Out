import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTab
} from "@/components/ui/dialog";
import { Download, FileSpreadsheet, X } from "lucide-react";
import { format, isWithinInterval, parseISO, getYear, getMonth } from "date-fns";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export function ExportDialog({ open, onOpenChange, expenses, categories }) {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('detailed'); // 'detailed' or 'monthly'
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      if (exportType === 'monthly') {
        await handleMonthlyExport();
      } else {
        await handleDetailedExport();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyExport = async () => {
    // Create monthly summary data
    const monthlyData = {};
    const categorizedData = {};

    // Initialize the data structure
    categories.forEach(category => {
      categorizedData[category.name] = {};
    });

    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const category = expense.category_details?.name || "Uncategorized";

      if (!categorizedData[category]) {
        categorizedData[category] = {};
      }

      if (!categorizedData[category][yearMonth]) {
        categorizedData[category][yearMonth] = 0;
      }

      categorizedData[category][yearMonth] += expense.amount;
    });

    // Transform data for Excel
    const months = [...new Set(expenses.map(e => {
      const date = new Date(e.expense_date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort();

    // Create headers (months)
    const headers = ['Expense categories', ...months.map(m => {
      const [year, month] = m.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
    })];

    // Create rows
    const rows = categories.map(category => {
      const row = [category.name];
      months.forEach(month => {
        row.push(categorizedData[category.name][month] || 0);
      });
      return row;
    });

    // Calculate total row
    const totalRow = ['Total'];
    months.forEach((month, columnIndex) => {
      const columnTotal = rows.reduce((sum, row) => {
        return sum + (row[columnIndex + 1] || 0);
      }, 0);
      totalRow.push(columnTotal);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);

    // Add column widths
    const colWidths = [
      { wch: 20 }, // Category column
      ...months.map(() => ({ wch: 12 })) // Month columns
    ];
    ws['!cols'] = colWidths;

    // Calculate lastRowIndex before styling
    const lastRowIndex = rows.length + 2; // Headers (1) + Data rows + Total row (1)

    // Style the worksheet
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Style for header row - Light green background
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[headerCellRef]) ws[headerCellRef] = {};
      ws[headerCellRef].s = {
        font: { 
          bold: true,
          name: 'Arial'
        },
        fill: { 
          patternType: "solid",
          fgColor: { rgb: "E2EFDA" } // Light green background for header
        },
        alignment: { horizontal: 'center' }
      };
    }

    // Style for alternating rows and data
    for (let R = 1; R < lastRowIndex - 1; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          font: { 
            bold: C === 0, // Make category names (first column) bold
            name: 'Arial'
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: R % 2 === 0 ? "F2F2F2" : "FFFFFF" } // Alternate light gray and white
          },
          alignment: C === 0 ? { horizontal: 'left' } : { horizontal: 'right' },
        };

        // If it's a number cell (not the first column), format as number
        if (C > 0) {
          ws[cellRef].z = '#,##0';
        }
      }
    }

    // Style for total row - Light green background like header
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: lastRowIndex - 1, c: C });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        font: { 
          bold: true,
          name: 'Arial'
        },
        fill: { 
          patternType: "solid",
          fgColor: { rgb: "E2EFDA" } // Light green background for total row
        },
        alignment: C === 0 ? { horizontal: 'left' } : { horizontal: 'right' },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } }
        }
      };
      
      // Number format for total amounts
      if (C > 0) {
        ws[cellRef].z = '#,##0';
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Summary");

    // Generate filename
    const fileName = `expense_summary_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const handleDetailedExport = async () => {
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
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || placeholder}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">Export Expenses</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>

            {/* Export Type Selector */}
            <div className="w-full flex gap-2">
              <Button
                variant={exportType === 'detailed' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setExportType('detailed')}
              >
                Detailed
              </Button>
              <Button
                variant={exportType === 'monthly' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setExportType('monthly')}
              >
                Monthly Summary
              </Button>
            </div>

            {/* Date Range Selector - Only show for detailed export */}
            {exportType === 'detailed' && (
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
            )}

            {/* Description */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {exportType === 'monthly' 
                  ? "Export monthly expense summary by categories"
                  : "Export detailed expenses as an Excel file."}
                {exportType === 'detailed' && dateRange.from && dateRange.to && (
                  <span className="block mt-1 text-xs text-blue-600">
                    Exporting expenses from {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
                  </span>
                )}
              </p>
            </div>

            {/* Export Button */}
            <Button
              className="w-full rounded-full"
              onClick={handleExport}
              disabled={loading || (exportType === 'detailed' && ((dateRange.from && !dateRange.to) || (!dateRange.from && dateRange.to)))}
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
