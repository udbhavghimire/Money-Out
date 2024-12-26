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
      const response = await axios.get("https://admin.sixdesign.ca/api/expenses/my-activity/");
      
      // Transform the nested structure into a flat array of activities
      const flatActivities = Object.entries(response.data.activities).flatMap(([date, dayActivities]) => {
        return dayActivities.map(activity => ({
          ...activity,
          date // Add the date to each activity
        }));
      });

      setActivities(flatActivities);
      setError(null);
    } catch (error) {
      setError("Failed to load activity log");
      console.error("Error fetching activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case "CREATE":
        return <Receipt className="h-4 w-4 text-blue-500" />;
      case "UPDATE":
        return <Edit className="h-4 w-4 text-orange-500" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActivityMessage = (activity) => {
    const actionText = activity.action_display;
    const expenseTitle = activity.expense_title;
    const amount = activity.expense_amount;

    if (activity.changes) {
      const changeDescriptions = activity.changes.map(change => 
        `${change.field} from "${change.old_value}" to "${change.new_value}"`
      ).join(", ");
      return `${actionText} expense "${expenseTitle}" (${changeDescriptions})`;
    }

    return `${actionText} expense "${expenseTitle}"`;
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach(activity => {
      const date = format(new Date(activity.timestamp), 'MMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

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
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-1">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {dateActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                      >
                        <div className="mt-1">{getActivityIcon(activity.action)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatActivityMessage(activity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Amount: ${parseFloat(activity.expense_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(activity.timestamp), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
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