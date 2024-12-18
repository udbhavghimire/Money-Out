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

  const filteredExpenses = expenses.filter((expense) =>
    expense.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen">
      {/* Background Container */}
      <div
        className="fixed inset-0 z-0 md:w-[430px] md:left-1/2 md:-translate-x-1/2"
        style={{
          backgroundImage: 'url("/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-sm mx-auto">
        {/* Money Out Header */}
        <div className="p-5">
          <div className="flex justify-start">
            <Image
              src="/money-out-logo.png"
              alt="Money Out"
              width={70}
              height={22}
              className="object-contain"
            />
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
                <button className="flex flex-col items-center">
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
                className="pl-10 bg-transparent border border-2 border-gray-300/50 rounded-3xl text-xs h-9 placeholder:text-gray-500 w-60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="px-8 pb-20">
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
        <div className="sticky bottom-0 left-0 right-0 flex items-center justify-center -mx-[25px] mt-auto">
          <Image
            src="/wave.png"
            alt="Wave Background"
            layout="responsive"
            width={100}
            height={4}
            className="pointer-events-none w-[calc(100%+40px)]"
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
      </div>
    </div>
  );
}
