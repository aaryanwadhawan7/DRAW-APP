"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface ChatMessage {
  message: string;
}
interface ChatRoomClientProps {
  messages: ChatMessage[];
  id: string;
}

export function ChatRoomClient({ messages, id }: ChatRoomClientProps) {
  const [socket, loading] = useSocket();
  const [chats, setChats] = useState<ChatMessage[]>(messages);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (socket && !loading) {
      socket.send(JSON.stringify({ type: "join-room", roomId: id }));

      const handleMessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.type === "chat") {
            setChats((prevChats) => [
              ...prevChats,
              { message: parsedData.message },
            ]);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
      socket.addEventListener("message", handleMessage);
      return () => socket.removeEventListener("message", handleMessage);
    }
  }, [socket, loading, id]);

  const sendMessage = () => {
    if (socket && !loading && currentMessage.trim() !== "") {
      socket.send(
        JSON.stringify({ type: "chat", roomId: id, message: currentMessage })
      );
      setCurrentMessage("");
    }
  };

  return (
    <div>
      <h3>Chat Room: {id}</h3>
      {loading && <div>Connecting...</div>}
      <div>
        {chats.map((chat, idx) => (
          <div key={idx}>{chat.message}</div>
        ))}
      </div>
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Enter message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button onClick={sendMessage}>Send message</button>
    </div>
  );
}
