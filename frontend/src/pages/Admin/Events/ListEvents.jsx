import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Input,
  Select,
  Modal,
  Table,
  Button,
  DatePicker,
  notification,
} from "antd";
import { getEvents, deleteEvent } from "../../../api_service/event";
import axios from "axios";
import { toast } from "react-toastify";

const { RangePicker } = DatePicker;

const EventList = () => {
  const [list, setList] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchStatus, setSearchStatus] = useState(""); // New state for status filter
  const [searchDateRange, setSearchDateRange] = useState([null, null]); // New state for date range filter
  const [categories, setCategories] = useState([]);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true); // State to toggle between grid and table view
  const [searchTimeRange, setSearchTimeRange] = useState([]); //
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        if (response && Array.isArray(response.data)) {
          setList(response.data);
          setFilteredEvents(response.data);
        } else {
          console.error("Dữ liệu trả về không phải là mảng:", response);
          setList([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sự kiện:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/categories/"
        );
        if (response && response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
        console.log(response.data.data);
        
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = list.filter((event) => {
      const matchesName = event.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesCategory = searchCategory
        ? event.category_id === searchCategory
        : true;
      const matchesStatus = searchStatus ? event.status === searchStatus : true;

      const matchesDateRange =
        !searchDateRange[0] ||
        (new Date(event.start_time) >= new Date(searchDateRange[0]) &&
          new Date(event.end_time) <= new Date(searchDateRange[1]));

      return (
        matchesName && matchesCategory && matchesStatus && matchesDateRange
      );
    });
    setFilteredEvents(filtered);
  }, [searchName, searchCategory, searchStatus, searchDateRange, list]);
  // useEffect(() => {
  //   const filtered = list.filter((event) => {
  //     const matchesName = event.name.toLowerCase().includes(searchName.toLowerCase());
  //     const matchesCategory = searchCategory ? event.category_id === searchCategory : true;
  //     const matchesStatus = searchStatus ? event.status === searchStatus : true;
  
  //     // Lọc theo khoảng thời gian
  //     const matchesTime =
  //       (!searchTimeRange.length ||
  //         (new Date(event.start_time) >= searchTimeRange[0] &&
  //          new Date(event.end_time) <= searchTimeRange[1]));
  
  //     return matchesName && matchesCategory && matchesStatus && matchesTime;
  //   });
  //   setFilteredEvents(filtered);
  // }, [searchName, searchCategory, searchStatus, searchTimeRange, list]);
  
  const onDelete = async (id) => {
    setDeletingEventId(id);
    setConfirmModalIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(deletingEventId);
      const updatedList = list.filter((event) => event.id !== deletingEventId);
      setList(updatedList);
      setFilteredEvents(updatedList);
      toast.success("Xóa sự kiện thành công!");
    } catch (error) {
      notification.error({ message: "Xóa sự kiện không thành công!" });
    }
    setDeletingEventId(null);
    setConfirmModalIsOpen(false);
  };

  const handleCancelDelete = () => {
    setDeletingEventId(null);
    setConfirmModalIsOpen(false);
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case "confirmed":
        return { text: "Đang chuẩn bị", color: "bg-yellow-500" };
      case "checkin":
        return { text: "Đang check-in", color: "bg-green-500" };
      case "ongoing":
        return { text: "Đang diễn ra", color: "bg-blue-500" };
      case "completed":
        return { text: "Đã kết thúc", color: "bg-gray-500" };
      case "canceled":
        return { text: "Đã hủy", color: "bg-red-500" };
      case "pending":
        return { text: "Đang chờ xác nhận", color: "bg-gray-300" };
      default:
        return { text: "Trạng thái không xác định", color: "bg-gray-300" };
    }
  };

  const columns = [
    {
      title: "Tên sự kiện",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại hình",
      dataIndex: "event_type",
      key: "event_type",
      render: (text) => (text === "online" ? "Trực tuyến" : "Trực tiếp"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`inline-block px-2 py-1 text-white ${
            getStatusColor(status).color
          }`}
        >
          {getStatusColor(status).text}
        </span>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      render: (start_time) => (
        <span>{new Date(start_time).toLocaleString()}</span>
      ),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      render: (end_time) => (
        <span>{new Date(end_time).toLocaleString()}</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, event) => (
        <span>
          <Link
            to={`/admin/update-event/${event.id}`}
            className="text-blue-500 mx-2"
          >
            <i className="fas fa-pencil-alt"></i>
          </Link>
          <i
            className="fas fa-trash-alt text-red-600 cursor-pointer"
            onClick={() => onDelete(event.id)}
          ></i>
          <Link to={`/admin/detail-event/${event.id}`}>
            <Button type="link">Xem</Button>
          </Link>
        </span>
      ),
    },
  ];
  

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Danh sách sự kiện
        </h2>
        <hr />
        <br />

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm sự kiện theo tên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1"
          />
          <Select
            placeholder="Chọn danh mục"
            className="flex-1"
            value={searchCategory}
            onChange={(value) => setSearchCategory(value)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              input && option?.label.toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { label: "Chọn danh mục", value: "" },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
            notFoundContent={searchCategory ? "Không tìm thấy danh mục" : null}
            onDropdownVisibleChange={(open) => {
              if (!searchCategory) {
                open = false;
              }
            }}
            dropdownRender={(menu) => (
              <div>
                <div style={{ maxHeight: 100, overflowY: "auto" }}>{menu}</div>
              </div>
            )}
          />
          <Select
            placeholder="Chọn trạng thái"
            value={searchStatus}
            onChange={(value) => setSearchStatus(value)}
            className="flex-1"
            allowClear
            options={[
              { label: "Chọn trạng thái", value: "" },
              { label: "Đang chuẩn bị", value: "confirmed" },
              { label: "Đang check-in", value: "checkin" },
              { label: "Đang diễn ra", value: "ongoing" },
              { label: "Đã kết thúc", value: "completed" },
              { label: "Đã hủy", value: "canceled" },
              { label: "Đang chờ xác nhận", value: "pending" },
            ]}
          />
          {/* Input tìm kiếm thời gian */}
      <RangePicker
        className="flex-1"
        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
        onChange={(dates) => setSearchTimeRange(dates ? [dates[0].toDate(), dates[1].toDate()] : [])}
      />
        </div>

        <button
          onClick={() => setIsGridView(!isGridView)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isGridView ? "Chuyển sang dạng bảng" : "Chuyển sang dạng card"}
        </button>

        {isGridView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
            {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative flex flex-col bg-white p-6 rounded-md shadow-lg cursor-pointer border-2 border-gray-50 hover:border-black transition-colors duration-300"
                >
                  <div
                    className={`absolute top-2 left-2 ${
                      getStatusColor(event.status).color
                    } text-white px-3 py-1 text-sm rounded-br-md z-10`}
                  >
                    {getStatusColor(event.status).text}
                  </div>
                  <div className="icons absolute top-2 right-2 p-2 text-right z-10">
                    <Link to={`/admin/update-event/${event.id}`}>
                      <i className="fas fa-pencil-alt mx-3 text-gray-600"></i>
                    </Link>
                    <i
                      className="fas fa-trash-alt text-red-600 cursor-pointer"
                      onClick={() => onDelete(event.id)}
                    ></i>
                  </div>
                  <img
                    src={event.thumbnail}
                    className="w-full h-[150px] rounded-lg shadow-lg object-cover mt-4"
                    alt={event.name}
                  />
                  <h2 className="text-xl font-semibold mb-2 truncate max-w-full">
                    {event.name}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Loại hình:{" "}
                    {event.event_type === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </p>
                  <p className="text-green-500 mb-2">
                    {event.status === "ongoing"
                      ? `Đang diễn ra từ ${new Date(
                          event.start_time
                        ).toLocaleDateString()}`
                      : event.status === "confirmed"
                      ? `Sẽ diễn ra vào ${new Date(
                          event.start_time
                        ).toLocaleDateString()}`
                      : event.status =="checkin"
                      ? `Đang trong thời gian check-in`
                      : `Sự kiện đã kết thúc vào ${new Date(
                          event.end_time
                        ).toLocaleDateString()}`}
                  </p>
                  {event.event_type === "online" && (
                    <a
                      href={event.link_online}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline mb-2 block"
                    >
                      Tham gia Online
                    </a>
                  )}
                  <div className="flex-grow"></div>
                  <div className="flex justify-center mt-auto">
                    <Link to={`/admin/detail-event/${event.id}`}>
                      <button className="btn btn-info bg-blue-500 text-white px-4 py-2 rounded-lg">
                        Xem chi tiết
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">Không có sự kiện nào.</p>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEvents}
            rowKey="id"
            pagination={true}
          />
        )}
      </div>

      {/* Modal xóa sự kiện */}
      <Modal
        title="Xác nhận xóa"
        open={confirmModalIsOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <p>Bạn có chắc chắn muốn xóa sự kiện này?</p>
      </Modal>
    </div>
  );
};

export default EventList;
