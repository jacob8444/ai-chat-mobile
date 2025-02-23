import { Chat, Message } from "@/constants/Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Constants from "expo-constants";

const CHAT_PREFIX = "chat-";

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

class ChatError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

const getApiKey = (): string => {
  const apiKey =
    Constants.expoConfig?.extra?.openrouterApiKey ||
    process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ChatError("API key not found", "API_KEY_MISSING");
  }
  return apiKey;
};

const handleApiError = async (response: Response): Promise<never> => {
  const errorText = await response.text();
  let errorMessage = `Server error (${response.status})`;

  try {
    const errorData: ApiErrorResponse = JSON.parse(errorText);
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch {
    // Use default error message if JSON parsing fails
  }

  throw new ChatError(errorMessage, "API_ERROR");
};

export const loadChats = async (): Promise<Chat[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = keys.filter((key) => key.startsWith(CHAT_PREFIX));
    const chatData = await AsyncStorage.multiGet(chatKeys);

    return chatData
      .map(([_, value]) => {
        try {
          return value ? (JSON.parse(value) as Chat) : null;
        } catch {
          return null;
        }
      })
      .filter((chat): chat is Chat => chat !== null)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  } catch (error) {
    console.error("Error loading chats:", error);
    return [];
  }
};

export const filterChats = (chats: Chat[], searchQuery: string): Chat[] => {
  const query = searchQuery.toLowerCase().trim();
  return chats.filter((chat) => chat.name.toLowerCase().includes(query));
};

export const deleteChat = async (
  chatId: string,
  prevChats: Chat[]
): Promise<Chat[]> => {
  try {
    await AsyncStorage.removeItem(`${CHAT_PREFIX}${chatId}`);
    return prevChats.filter((chat) => chat.id !== chatId);
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new ChatError("Failed to delete chat");
  }
};

export const createNewChat = async (chats: Chat[]): Promise<Chat[]> => {
  const newChat: Chat = {
    id: Date.now().toString(),
    name: `New Chat ${chats.length + 1}`,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(
      `${CHAT_PREFIX}${newChat.id}`,
      JSON.stringify(newChat)
    );
    return [newChat, ...chats];
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw new ChatError("Failed to create new chat");
  }
};

export const newChatMessage = async (
  chatId: string | undefined,
  message: string,
  prevMessages: Message[] | undefined,
  selectedModel: string,
  useWebSearch: boolean
): Promise<Chat> => {
  const newMessage: Message = {
    id: Date.now().toString(),
    content: message,
    createdAt: new Date().toISOString(),
    role: "user",
  };

  if (!chatId) {
    const chats = await createNewChat([]);
    const chatWithMessage: Chat = {
      ...chats[0],
      messages: [newMessage],
    };

    await AsyncStorage.setItem(
      `${CHAT_PREFIX}${chatWithMessage.id}`,
      JSON.stringify(chatWithMessage)
    );
    return chatWithMessage;
  }

  try {
    const chatKey = `${CHAT_PREFIX}${chatId}`;
    const chatJson = await AsyncStorage.getItem(chatKey);

    if (!chatJson) {
      throw new ChatError("Chat not found", "CHAT_NOT_FOUND");
    }

    const chat: Chat = JSON.parse(chatJson);
    const updatedChat: Chat = {
      ...chat,
      messages: [...(prevMessages || []), newMessage],
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(chatKey, JSON.stringify(updatedChat));
    return updatedChat;
  } catch (error) {
    if (error instanceof ChatError) throw error;
    throw new ChatError("Failed to add new message");
  }
};

export const getChat = async (
  chatId: string | undefined
): Promise<Chat | null> => {
  if (!chatId) return null;

  try {
    const chatJson = await AsyncStorage.getItem(`${CHAT_PREFIX}${chatId}`);
    return chatJson ? JSON.parse(chatJson) : null;
  } catch (error) {
    console.error("Error getting chat:", error);
    throw new ChatError("Failed to retrieve chat");
  }
};

interface StreamUpdate {
  content: string;
  chatName: string;
}

const processStreamChunk = (
  chunk: string,
  currentContent: string
): StreamUpdate => {
  const lines = chunk.split("\n");
  let streamedContent = currentContent;
  let chatName = "";

  for (const line of lines) {
    if (!line.trim() || line.includes("[DONE]")) continue;

    try {
      const parsedLine = JSON.parse(line.replace(/^data: /, ""));
      const content = parsedLine.choices[0]?.delta?.content || "";
      streamedContent += content;

      const titleMatch = streamedContent.match(/TITLE:([^\n]+)/);
      if (titleMatch) {
        chatName = titleMatch[1].trim();
        streamedContent = streamedContent.replace(/TITLE:[^\n]+\n?/, "").trim();
      }
    } catch (e) {
      console.error("Error parsing streaming response:", e);
    }
  }

  return { content: streamedContent, chatName };
};

export const handleAiResponse = async (
  content: string,
  selectedImage: string | undefined,
  chat: Chat,
  model: string,
  onStreamUpdate?: (updatedChat: Chat) => void
): Promise<Chat> => {
  try {
    const apiKey = getApiKey();
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. For each response, you will: 1. Provide a direct answer to the user's query 2. On a new line after your response, provide a brief title (3-4 words) for this conversation, formatted exactly as: TITLE: your_title_here",
      },
      {
        role: "user",
        content: selectedImage
          ? [
              { type: "text", text: content },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${selectedImage}` },
              },
            ]
          : content,
      },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Title": "<YOUR_SITE_NAME>",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, stream: true }),
      }
    ).catch((error) => {
      throw new ChatError(`Network error: ${error.message}`, "NETWORK_ERROR");
    });

    if (!response.ok) await handleApiError(response);
    if (!response.body) {
      throw new ChatError("Response body is null", "STREAM_ERROR");
    }

    const messageId = Date.now().toString();
    const streamingMessage: Message = {
      id: messageId,
      content: "",
      role: "ai",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    let updatedChat: Chat = {
      ...chat,
      messages: [...chat.messages, streamingMessage],
    };

    let streamedContent = "";
    let chatName = chat.name;
    let buffer = "";

    try {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf("\n");
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              streamedContent += content;

              const titleMatch = streamedContent.match(/TITLE:([^\n]+)/);
              if (titleMatch) {
                chatName = titleMatch[1].trim();
                streamedContent = streamedContent
                  .replace(/TITLE:[^\n]+\n?/, "")
                  .trim();
              }

              updatedChat = {
                ...updatedChat,
                name: chatName,
                messages: [
                  ...chat.messages,
                  { ...streamingMessage, content: streamedContent },
                ],
              };

              onStreamUpdate?.(updatedChat);
            } catch (parseError) {
              console.warn("Error parsing stream line:", parseError);
              continue;
            }
          }
        }
      }
    } catch (streamError) {
      console.error("Streaming error:", streamError);
      throw new ChatError("Error processing stream", "STREAM_ERROR");
    }

    const finalChat: Chat = {
      ...chat,
      name: chatName,
      messages: [
        ...chat.messages,
        {
          id: messageId,
          content: streamedContent.trim(),
          role: "ai",
          createdAt: new Date().toISOString(),
          isStreaming: false,
        },
      ],
    };

    await AsyncStorage.setItem(
      `${CHAT_PREFIX}${chat.id}`,
      JSON.stringify(finalChat)
    );
    return finalChat;
  } catch (error) {
    console.error("API request failed:", error);

    const errorMessage =
      error instanceof ChatError
        ? error.message
        : "An error occurred while processing your request";

    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    return chat;
  }
};
