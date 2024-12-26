import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";
import { X, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingLabelInput = ({ label, value, onChange, type = "text", className = "", ...props }) => {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`peer w-full border rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        placeholder={label}
        {...props}
      />
      <label className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">
        {label}
      </label>
    </div>
  );
};

const FloatingLabelTextarea = ({ label, value, onChange, className = "", ...props }) => {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        className={`peer w-full border rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] ${className}`}
        placeholder={label}
        {...props}
      />
      <label className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">
        {label}
      </label>
    </div>
  );
};

const CustomDateInput = ({ value, onClick }) => (
  <Button 
    variant="outline" 
    className="w-full justify-center py-5"
    onClick={onClick}
    type="button"
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    {value}
  </Button>
);

export function EditExpenseDialog({
  open,
  onOpenChange,
  expense,
  categories,
  onExpenseUpdated,
}) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    hst: "",
    category: "",
    description: "",
    expense_date: new Date(),
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        hst: expense.hst || "",
        category: expense.category,
        description: expense.description || "",
        expense_date: new Date(expense.expense_date),
      });
    }
  }, [expense]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      const updatedFormData = {
        ...formData,
        title: formData.description
      };

      Object.keys(updatedFormData).forEach((key) => {
        if (key === "expense_date") {
          submitData.append(key, format(updatedFormData[key], "yyyy-MM-dd"));
        } else if (key === "amount" || key === "hst") {
          submitData.append(key, parseFloat(updatedFormData[key] || 0));
        } else {
          submitData.append(key, updatedFormData[key]);
        }
      });

      if (selectedFile) {
        submitData.append("receipt", selectedFile);
      }

      const response = await axios.patch(`/api/expenses/${expense.id}/`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Object.assign(expense, response.data);

      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      onExpenseUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error details:", error.response?.data);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to update expense",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[325px] p-0 rounded-lg">
        <div className="flex flex-col items-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Edit Expense</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update the details of your expense
              </p>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="w-full max-w-[280px]">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm truncate">
                    {selectedFile.name || "Selected Receipt"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* Amount and HST Inputs */}
            <div className="flex gap-2 w-full max-w-[280px]">
              <div className="flex-1">
                <FloatingLabelInput
                  type="number"
                  step="0.01"
                  label="Amount ($)"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex-1">
                <FloatingLabelInput
                  type="number"
                  step="0.01"
                  label="HST Tax"
                  value={formData.hst}
                  onChange={(e) =>
                    setFormData({ ...formData, hst: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="w-full max-w-[280px]">
              <DatePicker
                selected={formData.expense_date}
                onChange={(date) => setFormData({
                  ...formData,
                  expense_date: date || new Date(),
                })}
                customInput={<CustomDateInput />}
                dateFormat="MMMM d, yyyy"
                isClearable={false}
              />
            </div>

            {/* Notes (previously description) */}
            <div className="w-full max-w-[280px]">
              <FloatingLabelTextarea
                label="Notes"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* Categories */}
            <div className="w-full max-w-[280px]">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={formData.category === category.id ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={`
                      h-6 rounded-full text-[10px]
                      ${
                        formData.category === category.id
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }
                      px-2 py-0 w-auto min-w-0 shrink-0
                    `}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* File Input */}
            <div className="w-full max-w-[280px] py-5">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('receipt').click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
              </Button>
            </div>

            {/* Submit Button */}
            <div className="w-full max-w-[280px]">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
