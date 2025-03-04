import React, { createContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Tickets } from "../interfaces/Ticket";
import {
  addTicket,
  deleteTicket,
  editTicket,
  getAllEvent,
  getAllTickets,
  restoreTicket,
  verifyTicket,
} from "../api_service/ServiceTicket";
import { Events } from "../interfaces/Event";
import { message } from "antd";

type Props = {
  children: React.ReactNode;
};

interface TypeTickets {
  onDel: (id: number, seatId: number) => void;
  onAdd: (data: Tickets) => void;
  onEdit: (data: Tickets, seatId: number) => void;
  onRestore: (id: number) => void;
  onVerify: (id: number) => void;
  tickets: Tickets[];
  events: Events[];
}

export const TicketsCT = createContext<TypeTickets>({} as TypeTickets);

const TicketsContext = ({ children }: Props) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Tickets[]>([]);
  const [events, setEvents] = useState<Events[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getAllTickets();
      setTickets(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getAllEvent();
      setEvents(data);
    })();
  }, []);

  const onDel = async (id: number, seatId: number) => {
    if (confirm("Bạn có muốn xóa không?")) {
      try {
        await deleteTicket(id, seatId);
        setTickets((prevTickets) =>
          prevTickets.filter((item) => item.id !== id)
        );
        toast.success("Xóa thành công");
        navigate("/admin/list-ticket-delete");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        toast.error("Lỗi khi xóa vé");
      }
    }
  };

  const onAdd = async (ticket: Tickets) => {
    try {
      // Gửi thẳng lên backend
      const newTicket = await addTicket(ticket);
      if (newTicket) {
        setTickets([...tickets, newTicket]);
        toast.success("Thêm thành công");
        navigate("/admin/ticket-list");
        window.location.reload();
      } else {
        // Handle unexpected server response
        toast.error("Vé đã tồn tại");
      }
    } catch (error) {
      console.error("Error adding ticket:", error);
      console.log(error);
      toast.error("Lỗi khi thêm vé");
    }
  };

  const onEdit = async (ticket: Tickets, seatId: number) => {
    try {
      const updatedTicket = await editTicket(ticket, seatId);
      setTickets(
        tickets.map((item) =>
          item.id === updatedTicket.id ? updatedTicket : item
        )
      );
      toast.success("Sửa thành công");
      navigate("/admin/ticket-list");
      window.location.reload();
    } catch (error) {
      console.error("Error editing ticket:", error);
      toast.error("Lỗi khi sửa vé");
    }
  };

  const onRestore = async (id: number) => {
    if (confirm("Bạn có muốn khôi phục vé không?")) {
      try {
        const restoredTicket = await restoreTicket(id);
        setTickets([...tickets, restoredTicket]);
        toast.success("Khôi phục thành công");
        navigate("/admin/ticket-list");
        window.location.reload();
      } catch (error) {
        console.log("Error restoring ticket:", error);
        toast.error("Lỗi khi khôi phục vé");
      }
    }
  };
  // Xác nhận vé
  const onVerify = async (id: number) => {
    try {
      const verifiedTicket = await verifyTicket(id);
      setTickets(
        tickets.map((item) => (item.id === id ? verifiedTicket : item))
      );
      toast.success("Xác nhận thành công");
    } catch (error) {
      console.error("Error verifying ticket:", error);
      toast.error("Lỗi khi xác nhận vé");
    }
  };

  return (
    <TicketsCT.Provider
      value={{
        onDel,
        onAdd,
        onEdit,
        onRestore,
        onVerify,
        tickets,
        events,
      }}
    >
      {children}
      <ToastContainer />
    </TicketsCT.Provider>
  );
};

export default TicketsContext;
