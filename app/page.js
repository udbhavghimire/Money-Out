"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { isAuthenticated } from "@/lib/auth";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
import { syncUserWithBackend } from "@/lib/user-sync";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Settings,
  DollarSign,
  Camera,
  X,
  CalendarIcon,
  Menu,
  Filter,
  Sliders,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ManageCategoriesDialog } from "@/components/expenses/manage-categories-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { WaveBackground } from "@/components/ui/wave-background";
import Image from "next/image";
import { CameraCapture } from "@/components/ui/camera";
import { FilterDialog } from "@/components/expenses/filter-dialog";

export default function ExpensesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [summary, setSummary] = useState({
    total_expenses: 0,
    by_category: [],
    week_total: 0,
    month_total: 0,
    year_total: 0,
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    expense_date: new Date(),
  });
  const { toast } = useToast();
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (isLoaded && !user) {
        router.push("/sign-in");
      } else if (user) {
        try {
          // Sync user with backend when they sign in
          await syncUserWithBackend(user);
          // After successful sync, fetch user data
          fetchExpenses();
          fetchCategories();
          fetchSummary();
        } catch (error) {
          console.error("Error initializing user:", error);
          toast({
            variant: "destructive",
            title: "Registration Error",
            description:
              error.message ||
              "Failed to initialize user data. Please try again.",
          });
        }
      }
    };

    initializeUser();
  }, [isLoaded, user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/expenses/");
      setExpenses(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories/");
      console.log("Fetched categories:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/expenses/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
  };

  const filteredExpenses = expenses.filter((expense) => {
    // Text search filter
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      !activeFilters.category ||
      expense.category.toString() === activeFilters.category;

    // Date range filter
    const matchesDateRange = () => {
      if (!activeFilters.dateRange?.from && !activeFilters.dateRange?.to)
        return true;

      const expenseDate = new Date(expense.expense_date);
      const fromDate = activeFilters.dateRange.from
        ? new Date(activeFilters.dateRange.from)
        : null;
      const toDate = activeFilters.dateRange.to
        ? new Date(activeFilters.dateRange.to)
        : null;

      if (fromDate && toDate) {
        return expenseDate >= fromDate && expenseDate <= toDate;
      } else if (fromDate) {
        return expenseDate >= fromDate;
      } else if (toDate) {
        return expenseDate <= toDate;
      }
      return true;
    };

    return matchesSearch && matchesCategory && matchesDateRange();
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.description);
      submitData.append("amount", parseFloat(formData.amount));
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append(
        "expense_date",
        format(formData.expense_date, "yyyy-MM-dd")
      );

      if (selectedFile) {
        submitData.append("receipt", selectedFile);
      }

      await axios.post("/api/expenses/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success",
        description: "Expense created successfully",
      });

      // Reset form
      setFormData({
        amount: "",
        category: "",
        description: "",
        expense_date: new Date(),
      });
      setSelectedFile(null);

      // Refresh data
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to create expense",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file) => {
    setSelectedFile(file);
    setShowCameraView(false);
    setShowReceiptDialog(false);
    setShowExpenseDialog(true);
  };

  const formatAmount = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background Container */}
      <div
        className="fixed inset-0 z-0 w-full md:w-[430px] md:left-1/2 md:-translate-x-1/2"
        style={{
          backgroundImage: 'url("/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto px-4">
        {/* Money Out Header */}
        <div className="p-5">
          <div className="flex flex-col items-start">
            <Image
              src="/money-out-logo.png"
              alt="Money Out"
              width={70}
              height={22}
              className="object-contain"
            />
            {user && (
              <p className="text-lg font-semibold text-gray-800 mt-2">
                Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="sticky top-0 z-10">
          <div className="p-3">
            <div className="flex justify-start items-center">
              <div className="flex items-center gap-6 bg-[#fff6d3] shadow-sm rounded-3xl pl-3 pr-12 py-3 ml-4">
                <div className="text-center">
                  <p className="text-[10px] font-medium text-gray-900">$200</p>
                  <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                    THIS WEEK
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-medium text-gray-900">$400</p>
                  <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                    THIS MONTH
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-medium text-gray-900">$800</p>
                  <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                    THIS YEAR
                  </p>
                </div>
              </div>

              {/* Filter Button */}
              <div className="flex items-center mx-5">
                <button
                  className="flex flex-col items-center"
                  onClick={() => setShowFilterDialog(true)}
                >
                  <SlidersHorizontal
                    className="h-4 w-4 text-gray-900"
                    strokeWidth={2.5}
                  />
                  <span className="text-[8px] uppercase font-medium text-gray-900 mt-0.5">
                    FILTER
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-5">
          <div className="mx-4">
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

        {/* Expense List */}
        <div className="px-4 pb-32">
          <ExpenseList
            expenses={filteredExpenses}
            categories={categories}
            onExpenseUpdated={() => {
              fetchExpenses();
              fetchSummary();
            }}
          />
        </div>

        {/* Upload Receipt Button */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center w-screen md:w-[430px] md:left-1/2 md:-translate-x-1/2">
          <Image
            src="/wave.png"
            alt="Wave Background"
            layout="responsive"
            width={100}
            height={4}
            className="pointer-events-none w-full"
            priority
          />
          <div
            className="absolute z-10 flex flex-col items-center"
            style={{ transform: "translateY(-10%)" }}
          >
            <button
              onClick={() => setShowReceiptDialog(true)}
              className="bg-blue-600 rounded-full p-5 shadow-lg transform hover:scale-105 transition-transform duration-200 mb-0.5"
            >
              <Camera className="h-10 w-10 text-white" />
            </button>
            <span className="text-sm font-bold text-gray-700">
              Upload Receipt
            </span>
          </div>
        </div>

        {/* Receipt Upload Dialog */}
        {showReceiptDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            {showCameraView ? (
              <CameraCapture
                onCapture={handleCameraCapture}
                onClose={() => setShowCameraView(false)}
              />
            ) : (
              <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Add Receipt</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose how you want to add your receipt
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 text-base"
                    onClick={() => setShowCameraView(true)}
                  >
                    Take Photo
                  </Button>
                  <Button
                    className="w-full h-12 text-base"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                          setShowReceiptDialog(false);
                          setShowExpenseDialog(true);
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload from Gallery
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="absolute right-4 top-4"
                  onClick={() => setShowReceiptDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Expense Dialog */}
        <CreateExpenseDialog
          open={showExpenseDialog}
          onOpenChange={setShowExpenseDialog}
          categories={categories}
          onExpenseCreated={() => {
            fetchExpenses();
            fetchSummary();
          }}
          initialFile={selectedFile}
        />

        <FilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          categories={categories}
          onFilter={handleFilter}
        />

        {/* Slide-up Modal */}
        {selectedExpense && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setSelectedExpense(null)}
          >
            <div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transform transition-all duration-300 ease-out animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              {/* Modal Content */}
              <div className="max-w-lg mx-auto">
                {/* Drag Indicator */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Expense Details */}
                <div className="flex justify-between items-start mb-8">
                  {/* Left Side - Title and Date */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {selectedExpense.description || "Expense Details"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(selectedExpense.expense_date),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>

                  {/* Right Side - Amount and Category */}
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold text-gray-900 mb-1">
                      ${formatAmount(selectedExpense.amount)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      {selectedExpense.category_details?.name ||
                        "Uncategorized"}
                    </span>
                  </div>
                </div>

                {/* View Receipt Button */}
                {selectedExpense.receipt && (
                  <div className="flex justify-center mt-auto">
                    <Button
                      variant="outline"
                      className="w-full max-w-[200px] text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
                      onClick={() => setShowFullImage(true)}
                    >
                      View Receipt
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
