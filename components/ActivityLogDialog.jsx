import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Activity, Receipt, Edit, Trash2, LogIn, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export function ActivityLogDialog({ open, onOpenChange }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/activities");
      setActivities(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to load activity log");
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "LOGIN":
        return <LogIn className="h-4 w-4 text-green-500" />;
      case "LOGOUT":
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case "CREATE_EXPENSE":
        return <Receipt className="h-4 w-4 text-blue-500" />;
      case "EDIT_EXPENSE":
        return <Edit className="h-4 w-4 text-orange-500" />;
      case "DELETE_EXPENSE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activities found
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.details}
                    </p>
                    {activity.amount && (
                      <p className="text-sm text-gray-500">
                        Amount: ${activity.amount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 