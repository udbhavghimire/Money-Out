import { SlidersHorizontal, Download, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from 'react';

export function StatsMobile({ 
  summary, 
  setShowFilterDialog, 
  setShowExportDialog,
  categories,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  isDialogOpen
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const getSelectedCategoryName = () => {
    if (selectedCategoryFilter === "all") return "";
    const selectedCategory = categories.find(
      category => category.id.toString() === selectedCategoryFilter
    );
    return selectedCategory ? selectedCategory.name : "All Expenses";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="md:hidden">
      {/* Stats and Filter Section */}
      <div className={`sticky top-0 z-[100] p-5 ${isDialogOpen ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          {/* Stats with Dropdown Section */}
          <div className="relative flex items-center z-[110]" ref={dropdownRef}>
            <div className="flex flex-col bg-[#fff6d3] shadow-sm rounded-3xl pl-3 pr-4 py-3">
              <p className="text-[10px] font-bold  mb-2 text-blue-600">
                {getSelectedCategoryName()}
              </p>
              <div className="flex items-center gap-6">
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
                
                {/* Category Dropdown Trigger */}
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="ml-2"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            

            {/* Dropdown Menu */}
            {showCategoryDropdown && (
              <div className="fixed right-[100px] top-[150px] mx-4 bg-white rounded-lg shadow-xl py-1 z-[110] max-w-[200px]">
                <div className=" overflow-y-auto">
                  <div className="py-2">
                    <button
                      className={`max-w-[200px] px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                        selectedCategoryFilter === "all" ? "text-blue-600 font-medium" : ""
                      }`}
                      onClick={() => {
                        setSelectedCategoryFilter("all");
                        setShowCategoryDropdown(false);
                      }}
                    >
                      All Expenses
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                          selectedCategoryFilter === category.id.toString()
                            ? "text-blue-600 font-medium"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCategoryFilter(category.id.toString());
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter and Export Buttons */}
          <div className="flex items-center gap-4">
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
  );
} 