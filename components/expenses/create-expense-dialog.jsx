import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";
import { CameraCapture } from "@/components/ui/camera";
import { ReceiptImages } from "../ReceiptImage";

export function CreateExpenseDialog({
  open,
  onOpenChange,
  categories,
  onExpenseCreated,
  initialFile
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "", // This will be used for notes
    expense_date: new Date(),
  });

  useEffect(() => {
    if (initialFile && !selectedFiles.includes(initialFile)) {
      setSelectedFiles(prev => [...prev, initialFile]);
    }
  }, [initialFile]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleCameraCapture = (file) => {
    setSelectedFiles(prev => [...prev, file]);
    setShowCamera(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true; // Allow multiple file selection
    input.onchange = (e) => {
      const newFiles = Array.from(e.target.files || []);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    };
    input.click();
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
      submitData.append("expense_date", format(formData.expense_date, "yyyy-MM-dd"));

      selectedFiles.forEach((file, index) => {
        submitData.append(`receipt_${index}`, file);
      });

      await axios.post("/api/expenses/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success",
        description: "Expense created successfully",
      });
      onExpenseCreated();
      onOpenChange(false);
      setFormData({
        amount: "",
        category: "",
        description: "",
        expense_date: new Date(),
      });
      setSelectedFiles([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] p-0 rounded-lg">
        <div className="flex flex-col items-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Add Expense</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the details of your expense
              </p>
            </div>
            
            <ReceiptImages
              files={selectedFiles}
              onRemove={removeFile}
              onAddMore={handleAddMore}
              onTakePhoto={() => setShowCamera(true)}
            />
          </div>
        </div>
        

        {showCamera ? (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="flex gap-2 w-full max-w-[280px]">
                {/* Amount Input */}
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="$ Amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="text-center text-lg py-5"
                    required
                  />
                </div>

                {/* hst taxes */}
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="HST Tax"
                    value={formData.hst}
                    onChange={(e) =>
                      setFormData({ ...formData, hst: e.target.value })
                    }
                    className="text-center text-lg py-5"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div className="w-full max-w-[280px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-center py-5"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.expense_date, "dd MMMM, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="center"
                    sideOffset={5}
                    onInteractOutside={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-lg border">
                      <Calendar
                        mode="single"
                        selected={formData.expense_date}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            expense_date: date || new Date(),
                          })
                        }
                        initialFocus
                        disabled={false}
                        className="rounded-md"
                        closeOnSelect={true}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes */}
              <div className="w-full max-w-[280px]">
                <Textarea
                  placeholder="Notes"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[80px]" required
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
           


              {/* Submit Button */}
              <div className="w-100 max-w-[280px]">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Save Expense"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
