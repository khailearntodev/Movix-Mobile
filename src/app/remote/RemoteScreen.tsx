import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import io from "socket.io-client";
import { SOCKET_URL } from "../../constants/config";
import { Play, Pause, Volume2 } from "lucide-react-native"; 

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  query: { isRemote: "true" }, 
});

export default function RemoteScreen() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Đã kết nối tới PC!");
    });
  }, []);

  const sendCommand = (cmd: string) => {
    socket.emit("remote_command", { command: cmd });
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-5">
      <Text className="text-white text-2xl font-bold mb-10">
        Movix Remote 🎮
      </Text>

      <Text className="text-gray-400 mb-5">
        Trạng thái: {isConnected ? "🟢 Online" : "🔴 Offline"}
      </Text>

      <View className="flex-row space-x-10 mb-10">
        <TouchableOpacity
          className="bg-blue-600 p-5 rounded-full"
          onPress={() => sendCommand("PLAY")}
        >
          <Play color="white" size={32} />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 p-5 rounded-full"
          onPress={() => sendCommand("PAUSE")}
        >
          <Pause color="white" size={32} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-gray-700 w-full p-4 rounded-lg items-center"
        onPress={() => sendCommand("VOLUME_UP")}
      >
        <Text className="text-white font-bold">Tăng âm lượng</Text>
      </TouchableOpacity>
    </View>
  );
}
