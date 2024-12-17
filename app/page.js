"use client";

import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto">
        {/* Money Out Header */}
        <div className="p-5 bg-white">
          <div className="flex justify-center">
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
        <div className="sticky top-0 bg-white z-10">
          <div className="bg-white p-3">
            <div className="flex justify-between items-center bg-[#FFFBEB] rounded-xl p-2.5 shadow-sm mx-4">
              <div className="text-center px-1">
                <p className="text-[12px] uppercase text-gray-500 mb-0.5">
                  THIS WEEK
                </p>
                <p className="font-semibold text-[12px]">
                  ${summary.week_total?.toFixed(2) || "200"}
                </p>
              </div>
              <div className="text-center px-1">
                <p className="text-[12px] uppercase text-gray-500 mb-0.5">
                  THIS MONTH
                </p>
                <p className="font-semibold text-[12px]">
                  ${summary.month_total?.toFixed(2) || "400"}
                </p>
              </div>
              <div className="text-center px-1">
                <p className="text-[12px] uppercase text-gray-500 mb-0.5">
                  THIS YEAR
                </p>
                <p className="font-semibold text-[12px]">
                  ${summary.year_total?.toFixed(2) || "800"}
                </p>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-full">
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-5 bg-white border-t border-gray-100">
          <div className="mx-4">
            <h2 className="text-blue-600 text-base font-semibold mb-2">
              EXPENSE HISTORY
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="SEARCH THE RECEIPT"
                className="pl-10 bg-gray-100 border-none rounded-3xl text-sm h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-white px-8 pb-20">
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
        <div className="sticky bottom-0 left-0 right-0 flex items-center justify-center -mx-[35px] mt-auto">
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
