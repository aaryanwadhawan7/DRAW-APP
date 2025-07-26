"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div style={{
      display : "flex",
      justifyContent : "center",
      alignItems : "center",
      height : "100vh",
      width : "100vw"
    }}>
      <div>
        <input
          value={roomId}
          onChange={(val) => {
            setRoomId(val.target.value);
          }}
          type="text"
          placeholder="Room Id"
          style = {{
            padding : 10,
            fontWeight : "bolder"
          }}
        />

        <button
          onClick={() => {
            router.push(`/room/${roomId}`);
          }}

          style={{
            padding : 10,
            fontWeight : "bolder"
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
