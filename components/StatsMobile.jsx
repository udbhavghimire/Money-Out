import { SlidersHorizontal, Download } from "lucide-react";

export function StatsMobile({ summary, setShowFilterDialog, setShowExportDialog }) {
  return (
    <div className="md:hidden px-3">
      {/* Stats and Filter Section */}
      <div className="sticky top-0 z-10">
        <div className="">
          <div className="flex justify-start items-center">
            <div className="flex items-center gap-6 bg-[#fff6d3] shadow-sm rounded-3xl pl-3 pr-12 py-3 ml-4">
              <div className="text-center">
                <p className="text-[10px] font-medium text-gray-900">
                  $
                  {(summary.stats?.week || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                  THIS WEEK
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium text-gray-900">
                  $
                  {(summary.stats?.month || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                  THIS MONTH
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium text-gray-900">
                  $
                  {(summary.stats?.year || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[8px] uppercase font-bold text-black mt-0.5">
                  THIS YEAR
                </p>
              </div>
            </div>
            {/* Filter and Export Buttons */}
            <div className="flex items-center gap-4 mx-5">
              <button
                className="flex flex-col items-center"
                onClick={setShowFilterDialog}
              >
                <SlidersHorizontal
                  className="h-4 w-4 text-gray-900"
                  strokeWidth={2.5}
                />
                <span className="text-[8px] uppercase font-medium text-gray-900 mt-0.5">
                  FILTER
                </span>
              </button>
              <button
                className="flex flex-col items-center"
                onClick={setShowExportDialog}
              >
                <Download
                  className="h-4 w-4 text-gray-900"
                  strokeWidth={2.5}
                />
                <span className="text-[8px] uppercase font-medium text-gray-900 mt-0.5">
                  EXPORT
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 