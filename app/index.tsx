import ChatView from "@/components/chat/views/ChatView";
import SideBar from "@/components/sidebar/views/SideBarView";
import OpenSettingsButton from "@/components/shared/ui/OpenSettingsButton";
import ToggleSideBarButton from "@/components/shared/ui/OpenSideBarButton";
import { Chat } from "@/constants/Types";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const onChatSelect = (chat: Chat | undefined) => {
    if (!chat) setSelectedChat(null);
    setSelectedChat(chat as Chat);
    setIsSideBarOpen(false);
  };

  // TODO: Implement panResponder for opening and closing the sidebar with zustand

  return (
    <View style={styles.container}>
      <ToggleSideBarButton
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      <OpenSettingsButton />
      <SideBar
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        onChatSelect={onChatSelect}
      />
      <ChatView chat={selectedChat} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#1a1a1a",
  },
});
