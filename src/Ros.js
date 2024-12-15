import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Table from "./Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Ros() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const path = process.env.REACT_APP_BASE_URL;
  const tableRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/getFile");
        const tableData = response.data.data;
        setTableData(tableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [path]);

  const triggerDownload = () => {
    console.log(tableRef.current);
    if (tableRef.current) {
      tableRef.current.downloadFilteredData()
      setDropdownVisible(false)
    }else{
        toast.error("Error in Downloading.", {
            position: "top-right",
            autoClose: 2000,
          });
    }
  };

  const handleFileUpload = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await axios.post("http://127.0.0.1:8000/upload", formData);
        toast.success("File Uploaded Successfully.", {
          position: "top-right",
          autoClose: 2000,
        });
        const response = await axios.get("http://127.0.0.1:8000/getFile");
        setTableData(response.data.data);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload the file.", {
          position: "top-right",
          autoClose: 2000,
        });
      } finally {
        setLoading(false);
        setDropdownVisible(false);
      }
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete("http://127.0.0.1:8000/deleteFile");
      toast.success("Files deleted successfully.", {
        position: "top-right",
        autoClose: 2000,
      });
      setTableData([]);
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error("Failed to delete files.", {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
      setDropdownVisible(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <div className="flex flex-col justify-center h-[100vh] items-center bg-white relative">
        <div className="my-10 mx-0">
            <p className="font-bold text-sans text-4xl text-slate-700">ROS LOG VIEWER</p>
        </div>
      <div className="bg-inherit rounded p-2 min-w-[40vw] min-h-[40vh] md:border-2 md:border-slate-200">
        <ToastContainer />
        <div className="relative flex justify-center">
          <button
            onClick={toggleDropdown}
            className="flex items-center bg-green-600 font-bold text-white border-2 border-gray-400 px-4 py-2 rounded-full"
          >
            <img
              src="http://localhost:3000/fileIcon.png"
              className="mx-2"
              width={25}
              height={10}
              alt="file"
            ></img>
            Actions
          </button>
          {/* Dropdown Menu */}
          {dropdownVisible && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-25 z-10"
                onClick={closeDropdown}
              ></div>
              <ul className="absolute mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-20">
                <div className="flex items-center text-white font-semibold  bg-green-400 hover:bg-green-300 border-b-2">
                  <img
                    src="http://localhost:3000/upload.png"
                    className="mx-2"
                    width={25}
                    height={10}
                    alt="file"
                  ></img>
                  <li className="px-4 py-2 cursor-pointer ">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileUpload}
                      accept=".txt, .log"
                      hidden
                    />
                    Upload File
                  </label>
                </li>
                </div>
                
                {tableData.length > 0 && (
                  <>
                  <div className="flex items-center text-white font-semibold  bg-red-400 hover:bg-red-300 border-b-2">
                  <img
                    src="http://localhost:3000/delete.png"
                    className="mx-2"
                    width={25}
                    height={10}
                    alt="file"
                  ></img>
                  <li
                      className="px-4 py-2 cursor-pointer"
                      onClick={handleDelete}
                    >
                      Delete Files
                    </li>
                </div><div className="flex items-center text-white font-semibold  bg-gray-400 hover:bg-gray-300">
                  <img
                    src="http://localhost:3000/download.png"
                    className="mx-2"
                    width={25}
                    height={10}
                    alt="file"
                  ></img>
                  <li
                      className="px-4 py-2 cursor-pointer"
                      onClick={triggerDownload}
                    >
                      Download
                    </li>
                </div>
                  </>
                )}
              </ul>
            </>
          )}
        </div>
        {/* Loading or Table */}
        {loading ? "loading" : <Table data={tableData} ref={tableRef}></Table>}
      </div>
    </div>
  );
}

export default Ros;
