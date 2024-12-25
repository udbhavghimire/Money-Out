import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import axios from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { Receipt, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Add this constant at the top of the file to easily switch between modes
const USE_SLIDE_ANIMATION = false; // Set to true for slide animation, false for expansion

export function ExpenseList({ expenses, onExpenseUpdated, categories }) {
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const { toast } = useToast();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Group expenses by time period and specific dates
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const expenseDate = parseISO(expense.expense_date);
    if (isToday(expenseDate)) {
      groups.today.push(expense);
    } else if (isYesterday(expenseDate)) {
      groups.yesterday.push(expense);
    } else {
      const dateKey = format(expenseDate, "MMM dd, yyyy");
      if (!groups.byDate[dateKey]) {
        groups.byDate[dateKey] = [];
      }
      groups.byDate[dateKey].push(expense);
    }
    return groups;
  }, { today: [], yesterday: [], byDate: {} });

  const handleReceiptClick = (e, expense) => {
    e.stopPropagation();
    setSelectedReceipt(expense);
    setReceiptModalOpen(true);
  };

  // Add useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks on modals and their content
      const isModalClick = event.target.closest('[role="dialog"]');
      const isExpenseItemClick = event.target.closest('.expense-item');
      
      if (expandedExpenseId && !isModalClick && !isExpenseItemClick) {
        setExpandedExpenseId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedExpenseId]);

  const renderExpenseItem = (expense) => (
    <div key={expense.id} className="relative expense-item">
      {/* Main expense item */}
      <div 
        className={`py-1.5  flex justify-between items-start border-b border-gray-100 cursor-pointer transition-all
          ${expandedExpenseId === expense.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        onClick={(e) => {
          e.stopPropagation();
          setExpandedExpenseId(expandedExpenseId === expense.id ? null : expense.id);
        }}
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
          <div className="w-full">
            <h3 className="text-xs font-medium text-gray-900 leading-none md:mr-0 mr-10">{expense.title}</h3>
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

      {/* Expansion mode actions - Now with slide down animation */}
      <div 
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
          ${!USE_SLIDE_ANIMATION && expandedExpenseId === expense.id ? 'max-h-[50px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex justify-start ml-8 py-2  border-b border-gray-100">
          {(expense.receipt || expense.receipt2 || expense.receipt3 || expense.receipt4) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(0);
                handleReceiptClick(e, expense);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Receipt className="h-4 w-4 text-blue-500" />
              <span className="sr-only">View Receipts</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditExpense(expense);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(expense.id);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>

      {/* Slide animation mode */}
      {USE_SLIDE_ANIMATION && (
        <div 
          className={`absolute inset-y-0 right-0 flex items-center px-2 
            backdrop-blur-md bg-white/60
            transition-transform duration-300 ease-out
            ${expandedExpenseId === expense.id ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center gap-0">
            {(expense.receipt || expense.receipt2 || expense.receipt3 || expense.receipt4) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(0);
                  handleReceiptClick(e, expense);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Receipt className="h-5 w-5 text-blue-500" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditExpense(expense);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(expense.id);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const formatAmount = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const handleDelete = async (expenseId) => {
    setExpenseToDelete(expenseId);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/expenses/${expenseToDelete}/`);
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
    } finally {
      setExpenseToDelete(null);
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

  const getReceiptUrl = (expense, index) => {
    const receipts = [
      expense.receipt,
      expense.receipt2,
      expense.receipt3,
      expense.receipt4
    ].filter(Boolean);
    return receipts[index];
  };

  const countImages = (expense) => {
    return [
      expense.receipt,
      expense.receipt2,
      expense.receipt3,
      expense.receipt4
    ].filter(Boolean).length;
  };

  const hasNextImage = (expense, currentIndex) => {
    const totalImages = countImages(expense);
    return currentIndex < totalImages - 1;
  };

  return (
    <>
      <div className="divide-y divide-gray-100 mb-16 md:mb-0 h-[60vh] md:h-auto overflow-y-auto">
        {/* Today's Expenses */}
        {groupedExpenses.today.length > 0 && (
          <div className="py-1">
            <h2 className="text-xs font-medium text-blue-600 mb-1">
              TODAY
            </h2>
            <div>{groupedExpenses.today.map(renderExpenseItem)}</div>
          </div>
        )}

        {/* Yesterday's Expenses */}
        {groupedExpenses.yesterday.length > 0 && (
          <div className="py-1">
            <h2 className="text-xs font-medium text-blue-600 mb-1">
              YESTERDAY
            </h2>
            <div>{groupedExpenses.yesterday.map(renderExpenseItem)}</div>
          </div>
        )}

        {/* Expenses by Date */}
        {Object.entries(groupedExpenses.byDate).map(([date, expenses]) => (
          <div key={date} className="py-1">
            <h2 className="text-xs font-medium text-blue-600 mb-1">
              {date.toUpperCase()}
            </h2>
            <div>{expenses.map(renderExpenseItem)}</div>
          </div>
        ))}
      </div>

      {/* Add Receipt Modal */}
      <Dialog 
        open={receiptModalOpen} 
        onOpenChange={(open) => {
          setReceiptModalOpen(open);
          if (!open) {
            setCurrentImageIndex(0);
          }
        }}
      >
        <DialogContent className="max-w-[320px] rounded-2xl">
          {selectedReceipt && (
            <div className="relative">
              {/* Image container */}
              <div className="relative w-full aspect-[2/3]">
                <Image
                  src={getReceiptUrl(selectedReceipt, currentImageIndex)}
                  alt={`Receipt ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain rounded-lg"
                />
              </div>

              {/* Navigation arrows - Updated logic */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev - 1)}
                    className="p-1 rounded-full bg-white/80 hover:bg-white shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {/* Show right arrow if there are more images, regardless of current index */}
                {countImages(selectedReceipt) > 1 && currentImageIndex < countImages(selectedReceipt) - 1 && (
                  <div className={`${currentImageIndex === 0 ? 'ml-auto' : ''}`}>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev + 1)}
                      className="p-1 rounded-full bg-white/80 hover:bg-white shadow-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {countImages(selectedReceipt)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditExpenseDialog
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
            // Don't affect expandedExpenseId
          }
        }}
        expense={editingExpense}
        categories={categories}
        onExpenseUpdated={onExpenseUpdated}
      />

      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent className="max-w-[320px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="rounded-full"
              onClick={() => setExpenseToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-full bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
