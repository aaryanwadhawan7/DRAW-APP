import { BACKEND_URL } from "../../config";
import { ChatRoomClient } from "../../components/ChatRoomClient";

async function getRoomId(slug: string) {
  const response = await fetch(`${BACKEND_URL}/room/${slug}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Room not found");
  }
  const data = await response.json();
  return data.room.id;
}

export default async function ChatRoomPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const roomId = await getRoomId(params.slug);
    return <ChatRoomClient id={roomId} messages={[]} />;
  } catch (e) {
    // You can render custom error UI or redirect
    return <div>Room not found.</div>;
  }
}
