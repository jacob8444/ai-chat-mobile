import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import { Chat } from "@/constants/Types";
import { ThemedText } from "@/components/shared/ui/ThemedText";
import { ThemedView } from "@/components/shared/ui/ThemedView";

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

let text = "";
let chatName = "";

const StreamedAiResponse = ({
  message,
  model,
  selectedImage,
  onComplete,
  currentChat,
}: {
  message: string;
  model: string;
  selectedImage: string | undefined;
  currentChat: Chat | null;
  onComplete: (updatedChat: Chat) => void;
}) => {
  const [output, setOutput] = useState("");

  useEffect(() => {
    let isMounted = true;
    const xhr = new XMLHttpRequest();
    const apiKey = getApiKey();

    try {
      xhr.open("POST", "https://openrouter.ai/api/v1/chat/completions");
      xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.responseType = "text";

      let lastProcessedLength = 0;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === xhr.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            let titleMatch = text.match(/TITLE:([^\n]+)/);
            if (titleMatch) {
              chatName = titleMatch[1].trim();
              text = text.replace(/TITLE:[^\n]+\n?/, "").trim();
            }

            // @ts-ignore
            const updatedChat: Chat = {
              ...currentChat,
              name: chatName,
              messages: [
                ...(currentChat?.messages || []),
                {
                  id: messageId,
                  content: text,
                  role: "ai",
                  createdAt: new Date().toISOString(),
                },
              ],
            };
            onComplete(updatedChat);
            text = "";
          } else {
            console.error(`API Error: ${xhr.status} ${xhr.statusText}`);
          }
        }
      };

      xhr.onprogress = () => {
        if (!isMounted) return;

        const currentResponse = xhr.responseText;
        const newChunk = currentResponse.slice(lastProcessedLength);
        lastProcessedLength = currentResponse.length;

        const lines = newChunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.trim() === "data: [DONE]") continue;

          if (line.trim().startsWith("data: ")) {
            try {
              const data = JSON.parse(line.trim().slice(6));
              const content = data.choices[0]?.delta?.content || "";
              if (content && isMounted) {
                setOutput((prev) => prev + content);
                text += content;
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      };

      xhr.onerror = () => {
        console.error("Network request failed");
      };

      xhr.send(
        JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. For each response, you will: 1. Provide a answer to the user's query 2. On a new line after your response, provide a brief title (3-4 words) for this conversation, formatted exactly as: TITLE: your_title_here",
            },
            {
              role: "user",
              content: selectedImage
                ? [
                    { type: "text", text: message },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${selectedImage}`,
                      },
                    },
                  ]
                : message,
            },
          ],
          stream: true,
        })
      );
    } catch (error) {
      console.error("Request setup error:", error);
    }

    return () => {
      isMounted = false;
      if (xhr.readyState !== xhr.DONE) {
        xhr.abort();
      }
    };
  }, [message]);

  return (
    <ThemedView
      style={[styles.messageContainer, styles.aiMessage]}
      accessibilityRole="text"
      accessibilityLabel={`ai message`}
    >
      <ThemedText style={styles.messageText}>{output}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    lineHeight: 24,
  },
});

export default StreamedAiResponse;
