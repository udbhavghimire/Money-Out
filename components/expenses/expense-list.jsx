import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import axios from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { Receipt, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";

export function ExpenseList({ expenses, onExpenseUpdated, categories }) {
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const { toast } = useToast();

  // Group expenses by time period
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const expenseDate = parseISO(expense.expense_date);
    if (isToday(expenseDate)) {
      groups.today.push(expense);
    } else if (isYesterday(expenseDate)) {
      groups.yesterday.push(expense);
    } else if (isThisWeek(expenseDate, { weekStartsOn: 1 })) {
      groups.thisWeek.push(expense);
    }
    return groups;
  }, { today: [], yesterday: [], thisWeek: [] });

  const renderExpenseItem = (expense) => (
    <div 
      key={expense.id} 
      className="py-1.5 flex justify-between items-start border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      onClick={() => setSelectedExpense(expense)}
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            className="h-4 w-4 text-gray-400"
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-medium text-gray-900 leading-none">{expense.title}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-none">
            {format(new Date(expense.expense_date), "MMM dd, yyyy")}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold leading-none">${formatAmount(expense.amount)}</p>
        <p className="text-[10px] text-gray-500 uppercase mt-0.5 leading-none">
          {expense.category_details?.name || "OFFICE / ADMIN"}
        </p>
      </div>
    </div>
  );

  const formatAmount = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const handleDelete = async (expenseId) => {
    try {
      await axios.delete(`/api/expenses/${expenseId}/`);
      onExpenseUpdated();
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense",
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "No date set";
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  // Add a function to format section headers
  const formatSectionHeader = (expenses) => {
    if (!expenses || expenses.length === 0) return '';
    
    const date = parseISO(expenses[0].expense_date);
    
    if (isToday(date)) {
      return 'TODAY';
    } else if (isYesterday(date)) {
      return 'YESTERDAY';
    } else {
      return format(date, 'MMM dd, yyyy').toUpperCase();
    }
  };

  return (
    <div className="divide-y divide-gray-100 mb-16">
      {/* Today's Expenses */}
      {groupedExpenses.today.length > 0 && (
        <div className="py-1">
          <h2 className="text-xs font-medium text-blue-600 mb-1">
            {formatSectionHeader(groupedExpenses.today)}
          </h2>
          <div>{groupedExpenses.today.map(renderExpenseItem)}</div>
        </div>
      )}

      {/* Yesterday's Expenses */}
      {groupedExpenses.yesterday.length > 0 && (
        <div className="py-1">
          <h2 className="text-xs font-medium text-blue-600 mb-1">
            {formatSectionHeader(groupedExpenses.yesterday)}
          </h2>
          <div>{groupedExpenses.yesterday.map(renderExpenseItem)}</div>
        </div>
      )}

      {/* This Week's Expenses */}
      {groupedExpenses.thisWeek.length > 0 && (
        <div className="py-1">
          <h2 className="text-xs font-medium text-blue-600 mb-1">
            {formatSectionHeader(groupedExpenses.thisWeek)}
          </h2>
          <div>{groupedExpenses.thisWeek.map(renderExpenseItem)}</div>
        </div>
      )}

      {/* Slide-up Modal */}
      {selectedExpense && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setSelectedExpense(null)}
        >
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transform transition-all duration-300 ease-out animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Modal Content */}
            <div className="max-w-lg mx-auto">
              {/* Drag Indicator */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
              </div>

              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Expense Details
                </h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Expense Details in List Style */}
              <div className="py-1.5 flex justify-between items-start border-b border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="h-4 w-4 text-gray-400"
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5}
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 leading-none">
                      {selectedExpense.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 leading-none">
                      {format(new Date(selectedExpense.expense_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">
                    ${formatAmount(selectedExpense.amount)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase mt-0.5 leading-none">
                    {selectedExpense.category_details?.name || "OFFICE / ADMIN"}
                  </p>
                </div>
              </div>

              {/* View Receipt Button - Centered at bottom */}
              {selectedExpense.receipt && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 w-full max-w-[200px]"
                    onClick={() => setShowFullImage(true)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    View Receipt
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Full Image View */}
          {showFullImage && (
            <div 
              className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowFullImage(false)}
            >
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="relative w-full max-w-2xl aspect-[3/4]">
                <Image
                  src={selectedExpense.receipt}
                  alt="Receipt"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <EditExpenseDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        onExpenseUpdated={onExpenseUpdated}
      />
    </div>
  );
}
