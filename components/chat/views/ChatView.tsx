import { Chat, ChatViewProps, Message } from "@/constants/Types";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Prompt from "./PromptView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMessage } from "../ui/ChatComponents";
import StreamedAiResponse from "../ui/StreamedAiResponse";

export default function ChatView({ chat }: ChatViewProps) {
  const [currentChat, setCurrentChat] = useState<Chat | null>(chat);
  const [isWaiting, setIsWaiting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [message, setMessage] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setCurrentChat(chat);
  }, [chat]);

  const handleStreamComplete = async (updatedChat: Chat) => {
    if (!currentChat) return;

    await AsyncStorage.setItem(
      `chat-${updatedChat.id}`,
      JSON.stringify(updatedChat)
    );
    setCurrentChat(updatedChat);
    setIsWaiting(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.chatList}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        >
          {currentChat?.messages.map((message, index) => (
            <ChatMessage key={message.id} message={message} index={index} />
          ))}
          {isWaiting && (
            <>
              <StreamedAiResponse
                message={message}
                model={model}
                selectedImage={selectedImage}
                currentChat={currentChat}
                onComplete={(updatedChat: Chat) => {
                  handleStreamComplete(updatedChat);
                }}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <Prompt
        onSubmit={async (
          content: string,
          selectedImage: string | undefined,
          chat: Chat,
          model: string
        ) => {
          setCurrentChat(chat);
          setMessage(content);
          setSelectedImage(selectedImage);
          setModel(model);
          setIsWaiting(true);
        }}
        chat={currentChat}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    fontSize: 24,
    color: "#f5f5f5",
    marginHorizontal: 2,
  },
  container: {
    flex: 1,
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  chatListContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#db2777",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333333",
  },
  messageText: {
    color: "#f5f5f5",
    fontSize: 16,
  },
});
