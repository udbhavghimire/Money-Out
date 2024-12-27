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
    switch (activity.action) {
      case 'CREATE':
        return 'Created Expense -';
      case 'UPDATE':
        return 'Edited Expense -';
      case 'DELETE':
        return 'Deleted Expense -';
      default:
        return 'Modified Expense -';
    }
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
      <DialogContent className="max-w-[350px] rounded-lg">
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
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                      >
                        <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">
                            <span className="text-gray-500">{formatActivityMessage(activity)}</span>
                            {" "}
                            {activity.expense_title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {format(new Date(activity.timestamp), "h:mm a")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900">
                            ${Number(activity.expense_amount || 0).toFixed(2)}
                          </p>
                          {activity.category_name && (
                            <p className="text-[11px] text-gray-500">
                              {activity.category_name}
                            </p>
                          )}
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