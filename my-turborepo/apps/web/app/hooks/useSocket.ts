import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket(): [WebSocket | undefined, boolean] {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };


    ws.onclose = () => {
      setSocket(undefined);
      setLoading(true); 
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    return () => {
      ws.close();
    };
  }, []);

  return [socket, loading];
}
