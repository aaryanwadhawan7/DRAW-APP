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

  // useEffect should be called unconditionally
  useEffect(() => {
    if (socket && !loading) {
      // Join the chat room when socket is ready
      socket.send(
        JSON.stringify({
          type: "join-room",
          roomId: id,
        })
      );

      // Handler for incoming messages
      const handleMessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.type === "chat") {
            setChats((prevChats) => [...prevChats, { message: parsedData.message }]);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      // Add listener
      socket.addEventListener("message", handleMessage);

      // Cleanup to remove listener on unmount or socket change
      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }
  }, [socket, loading, id]);

  return (
    <div>
      <h3>Chat Room: {id}</h3>
      <div>
        {chats.map((chat, index) => (
          <div key={index}>{chat.message}</div>
        ))}
      </div>

      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Enter message..."
      />

      <button
        onClick={() => {
          if (socket && !loading && currentMessage.trim() !== "") {
            socket.send(
              JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage,
              })
            );
            setCurrentMessage("");
          }
        }}
      >
        Send message
      </button>
    </div>
  );
}
