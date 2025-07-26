import { BACKEND_URL } from "../../config";
import axios from "axios";
import { ChatRoomClient } from "../../components/ChatRoomClient";


export async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.room.id;
}

export default async function ChatRoom1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roomId = await getRoomId(slug);
  return <ChatRoomClient id={roomId} messages={[]} />;
}

