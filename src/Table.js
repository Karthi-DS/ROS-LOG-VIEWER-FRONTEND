import React, { useState, forwardRef, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Table = forwardRef(({ data},ref) => {
  const originalData = data;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const itemsPerPage = 10;

  // Filter data based on search query and selected severity
  const filteredData = originalData.filter(
    (item) =>
      (item.node.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedSeverity === "ALL" || item.severity === selectedSeverity)
  );

  const downloadFilteredData = () => {
    console.log("triggered")
    if (filteredData.length === 0) {
      toast.info("No records to download.", {
        position: "top-right",
        autoClose: 500,
      });
    }
    else{
    const headers = ["S.No", "Timestamp", "Severity", "Node", "Message"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    filteredData.forEach((item, index) => {
      const row = [
        index + 1,
        item.timestamp,
        item.severity,
        item.node,
        item.message,
      ];
      csvRows.push(row.map((field) => `"${field}"`).join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_logs.csv";
    a.click();
    URL.revokeObjectURL(url);}
  };

  useImperativeHandle(ref, () => ({
    downloadFilteredData,
  }));

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get data for the current page
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginationRange = () => {
    const totalPagesToShow = 5;
    let start = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
    let end = Math.min(totalPages, start + totalPagesToShow - 1);

    if (end - start + 1 < totalPagesToShow) {
      start = Math.max(1, end - totalPagesToShow + 1);
    }

    let pages = [];
    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    originalData.length>0?
    <div>
          <div className="p-1 sm:p-0.5 lg:p-4 ">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 md:mb-8">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="border-2 border-gray-500 rounded-xl p-0.5 md:p-2 w-full sm:w-auto mb-1 sm:mb-0"
        />
        <select
          value={selectedSeverity}
          onChange={(e) => {
            setSelectedSeverity(e.target.value);
            setCurrentPage(1);
          }}
          className="border-2 border-gray-500 rounded-xl p-0.5 md:p-2  w-full sm:w-auto"
        >
          <option value="ALL">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="DEBUG">DEBUG</option>
        </select>
      </div>

      <div className="overflow-x-auto md:mb-8 mb-2">
        <table className="table-auto w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">S.No</th>
              <th className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">Timestamp</th>
              <th className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">Severity</th>
              <th className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">Node</th>
              <th className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">Message</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length>0?currentData.map((item, index) => (
              <tr
                key={index}
                className={`${
                  item.severity === "WARN"? "bg-yellow-400 hover:bg-yellow-200":
                  item.severity === "ERROR"? "bg-red-400 hover:bg-red-200":
                  index % 2 === 0 ? "bg-white hover:bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <td className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">
                  {index}
                </td>
                <td className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">
                  {item.timestamp}
                </td>
                <td className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">
                  {item.severity}
                </td>
                <td className="md:px-4 md:py-2 sm:px-1 sm:py-0.5 border border-gray-300">{item.node}</td>
                <td className="md:px-4 md:py-2 sm:px-1 border border-gray-300">
                  {item.message}
                </td>
              </tr>
            )):<tr>
              <td colSpan={5} className="text-center">No Records for this search.</td>
              </tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-center items-center mt-1 space-x-0.5 md:space-x-4 sm:space-x-1">
        {paginationRange().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={`px-1 py-0.5 md:p-2 rounded border ${
              currentPage === page
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-500 border-blue-500 hover:bg-blue-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
    </div>:<div className="flex justify-center items-center min-h-[40vh] text-gray-700 text-3xl font-bold">No records to display</div>
  );
});

export default Table;
