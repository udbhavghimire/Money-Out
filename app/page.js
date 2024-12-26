"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
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
  Upload,
  Download,
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
import { ExportDialog } from "@/components/expenses/export-dialog";
import { StatsMobile } from "@/components/StatsMobile";
import { SearchMobile } from "@/components/SearchMobile";
import SelectedFilter from "@/components/SelectedFilter";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LogoutButton } from "@/components/LogoutButton";
import { ActivityLogDialog } from "@/components/ActivityLogDialog";

export default function ExpensesPage() {
  const router = useRouter();
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
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    dateRange: { from: undefined, to: undefined },
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchSummary();
  }, []);

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
    setActiveFilters({
      categories: filters.categories || [],
      dateRange: filters.dateRange || { from: undefined, to: undefined },
    });
  };

  const filteredExpenses = expenses.filter((expense) => {
    // Text search filter
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      !activeFilters.categories?.length ||
      activeFilters.categories.includes(expense.category.toString());

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

  const logActivity = async (type, details, amount = null) => {
    try {
      await axios.post("/api/activities", {
        type,
        details,
        amount,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
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

      // Log the activity
      await logActivity(
        "CREATE_EXPENSE",
        `Created expense: ${formData.description}`,
        parseFloat(formData.amount)
      );
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

  const getFilteredStats = () => {
    if (selectedCategoryFilter === "all") {
      return summary.stats || { week: 0, month: 0, year: 0 };
    }

    // Filter expenses by selected category
    const filteredExpenses = expenses.filter(
      (expense) => expense.category.toString() === selectedCategoryFilter
    );

    // Calculate stats for filtered expenses
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return {
      week: filteredExpenses
        .filter((e) => new Date(e.expense_date) >= weekStart)
        .reduce((sum, e) => sum + e.amount, 0),
      month: filteredExpenses
        .filter((e) => new Date(e.expense_date) >= monthStart)
        .reduce((sum, e) => sum + e.amount, 0),
      year: filteredExpenses
        .filter((e) => new Date(e.expense_date) >= yearStart)
        .reduce((sum, e) => sum + e.amount, 0),
    };
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/signin");
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background Container */}
      <div
        className="fixed inset-0 -z-10 w-full md:w-[100%] md:left-0 md:translate-x-0 md:bg-gray-50"
        style={{
          backgroundImage: 'url("/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "@media (min-width: 768px)": {
            backgroundSize: "30%",
            backgroundPosition: "left center",
          },
        }}
      />

      {/* Only show StatsMobile when camera is not active */}
      {!showCameraView && (
        <>
          <div className="p-5 px-6 block md:hidden">
            <div className="flex justify-between items-center">
              <Image
                src="/money-out-logo.png"
                alt="Money Out"
                width={70}
                height={22}
                className=""
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="justify-start h-12 px-4 hover:bg-gray-100"
                      onClick={() => setShowActivityLog(true)}
                    >
                      Activity Log
                    </Button>
                    <LogoutButton />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <StatsMobile
            summary={{
              stats: getFilteredStats(),
            }}
            setShowFilterDialog={() => setShowFilterDialog(true)}
            setShowExportDialog={() => setShowExportDialog(true)}
            categories={categories}
            selectedCategoryFilter={selectedCategoryFilter}
            setSelectedCategoryFilter={setSelectedCategoryFilter}
            isDialogOpen={showReceiptDialog || showExpenseDialog}
          />

          {/* Selected Filter Mobile */}
          <div className="py-3 px-5 md:hidden">
            <SelectedFilter
              activeFilters={activeFilters}
              categories={categories}
              handleFilter={handleFilter}
              setShowFilterDialog={setShowFilterDialog}
            />
          </div>

          {/* Mobile Search Section */}
          <SearchMobile
            activeFilters={activeFilters}
            categories={categories}
            handleFilter={handleFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowFilterDialog={setShowFilterDialog}
          />
        </>
      )}

      {/* Content Container - Updated with desktop layout */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto px-4 md:max-w-none md:px-0">
        {/* Desktop Header */}
        <div className="hidden md:block w-full bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Image
              src="/money-out-logo.png"
              alt="Money Out"
              width={100}
              height={32}
              className="object-contain"
            />
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="justify-start h-12 px-4 hover:bg-gray-100"
                      onClick={() => setShowActivityLog(true)}
                    >
                      Activity Log
                    </Button>
                    <LogoutButton />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Desktop Layout Container */}
        <div className="md:max-w-7xl md:mx-auto md:px-6 md:py-8">
          {/* Main Content Area - Combined Stats, Filters, and Expenses */}
          <div className="md:bg-white md:rounded-2xl md:p-6 md:shadow-sm">
            {/* Stats and Filters Section */}
            <div className="hidden md:block mb-6 border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-sm text-gray-500">This Week</p>
                      <p className="text-md font-bold">
                        $
                        {getFilteredStats().week.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">This Month</p>
                      <p className="text-md font-bold">
                        $
                        {getFilteredStats().month.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">This Year</p>
                      <p className="text-md font-bold">
                        $
                        {getFilteredStats().year.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {/* Stats Section with Category Filter */}
                    <div className="flex items-center gap-4 mb-4">
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) =>
                          setSelectedCategoryFilter(e.target.value)
                        }
                        className="border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">All Expenses</option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter and Export Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="justify-start"
                    variant="outline"
                    onClick={() => setShowFilterDialog(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter Expenses
                  </Button>

                  {/* Desktop Upload Button */}
                  <Button
                    className="md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowReceiptDialog(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Receipt
                  </Button>
                  <Button
                    className="justify-start"
                    variant="outline"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Filter Desktop */}
            <div className="hidden md:block">
              <SelectedFilter
                activeFilters={activeFilters}
                categories={categories}
                handleFilter={handleFilter}
                setShowFilterDialog={setShowFilterDialog}
              />
            </div>

            <div className="md:block hidden">
              <h2 className="text-blue-600 text-base font-semibold mb-2">
                EXPENSE HISTORY
                {activeFilters.categories?.length > 0
                  ? ` - ${categories
                      .filter((cat) =>
                        activeFilters.categories.includes(cat.id.toString())
                      )
                      .map((cat) => cat.name)
                      .join(" & ")}`
                  : ""}
              </h2>
            </div>

            {/* Search and Upload Section */}
            <div className="md:flex md:justify-between md:items-center md:mb-6 hidden mt-6">
              <div className="relative md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="SEARCH THE RECEIPT"
                  className="pl-10 bg-transparent border-2 border-gray-300/50 rounded-3xl h-9 placeholder:text-gray-500"
                  style={{ fontSize: "12px" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Expense List */}
            <div className="md:mt-0 mx-5 md:mx-0">
              <ExpenseList
                expenses={filteredExpenses}
                categories={categories}
                onExpenseUpdated={() => {
                  fetchExpenses();
                  fetchSummary();
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile-only bottom upload button */}
        <div className="fixed  bottom-[80px] left-0 right-0 md:hidden flex items-center justify-center w-screen md:w-[430px] md:left-1/2 md:-translate-x-1/2 ">
          {/* <Image
            src="/wave.png"
            alt="Wave Background"
            layout="responsive"
            width={100}
            height={4}
            className="pointer-events-none w-full"
            priority
          /> */}
          <div
            className="absolute  flex flex-col items-center"
            style={{ transform: "translateY(-10%)" }}
          >
            <button
              onClick={() => setShowReceiptDialog(true)}
              className="bg-blue-600 rounded-full p-5
                shadow-[0_10px_35px_-5px_rgba(59,130,246,0.6),0_4px_15px_-3px_rgba(59,130,246,0.4)] 
                hover:shadow-[0_20px_45px_-5px_rgba(59,130,246,0.7),0_8px_25px_-5px_rgba(59,130,246,0.5)]
                transform hover:scale-105 hover:-translate-y-1.5 
                transition-all duration-300 ease-out mb-0.5
                relative"
            >
              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
              <Camera className="h-10 w-10 text-white relative z-10" />
            </button>
            <span
              className="text-sm font-bold text-gray-700 
              drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            >
              Upload Receipt
            </span>
          </div>
        </div>

        {/* Receipt Upload Dialog */}
        {showReceiptDialog && !showCameraView && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowReceiptDialog(false)}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-sm mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowReceiptDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-8 z-[1000]">
                {/* Icon and Title */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Three stacked receipt icons */}
                      <div className="absolute -right-4 -top-1 transform rotate-6">
                        <div className="w-12 h-16 bg-gray-100 rounded-lg"></div>
                      </div>
                      <div className="absolute -left-4 -top-1 transform -rotate-6">
                        <div className="w-12 h-16 bg-gray-100 rounded-lg"></div>
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-2">
                    Upload Receipt
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload your receipt by taking photos or from your device
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full h-14 text-base bg-black hover:bg-gray-800 rounded-full flex items-center justify-center gap-2"
                    onClick={async () => {
                      try {
                        // Check for camera permissions first
                        const permissionResult =
                          await navigator.permissions.query({ name: "camera" });

                        if (permissionResult.state === "denied") {
                          alert(
                            "Please enable camera access in your browser settings to use this feature."
                          );
                          return;
                        }

                        setShowReceiptDialog(false);
                        // Small delay to ensure the receipt dialog is closed
                        setTimeout(() => {
                          setShowCameraView(true);
                        }, 100);
                      } catch (error) {
                        console.error(
                          "Error checking camera permissions:",
                          error
                        );
                        // Fallback for browsers that don't support permission query
                        setShowReceiptDialog(false);
                        setTimeout(() => {
                          setShowCameraView(true);
                        }, 100);
                      }
                    }}
                  >
                    <Camera className="h-5 w-5" />
                    TAKE A PHOTO
                  </Button>
                  <Button
                    className="w-full h-14 text-base bg-black hover:bg-gray-800 rounded-full flex items-center justify-center gap-2"
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
                    <Upload className="h-5 w-5" />
                    UPLOAD FROM DEVICE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera View */}
        {showCameraView && (
          <div className="fixed inset-0 z-[9999] bg-black">
            <CameraCapture
              onCapture={(file) => {
                handleCameraCapture(file);
                setShowCameraView(false);
              }}
              onClose={() => {
                setShowCameraView(false);
              }}
            />
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

        {/* Filter Dialog */}
        <FilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          categories={categories}
          onFilter={handleFilter}
          activeFilters={activeFilters}
        />

        {/* Export Dialog */}
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          expenses={filteredExpenses}
          categories={categories}
        />

        <ActivityLogDialog
          open={showActivityLog}
          onOpenChange={setShowActivityLog}
        />
      </div>
    </div>
  );
}
