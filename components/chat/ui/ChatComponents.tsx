import { ThemedText } from "@/components/shared/ui/ThemedText";
import { ThemedView } from "@/components/shared/ui/ThemedView";
import { ChatMessageProps } from "@/constants/Types";
import { StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

export function ChatMessage({ message, index }: ChatMessageProps) {
  return (
    <ThemedView
      key={`${message.id}-${index}`}
      style={[
        styles.messageContainer,
        message.role === "user" ? styles.userMessage : styles.aiMessage,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${
        message.role === "user" ? "User" : "Assistant"
      } message`}
    >
      {message.role === "user" ? (
        <ThemedText style={styles.messageText} accessibilityRole="text">
          {message.content}
        </ThemedText>
      ) : (
        <Markdown
          style={{
            body: styles.messageText,
            inline_code: {
              ...styles.codeBlock,
              backgroundColor: "transparent",
              color: "#000",
            },
            code_block: styles.codeBlock,
            fence: styles.codeBlock,
          }}
        >
          {message.content}
        </Markdown>
      )}
    </ThemedView>
  );
}

export function ChatMessageLoading() {
  return (
    <ThemedView
      style={[styles.messageContainer, styles.aiMessage]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading message"
    >
      <ThemedText style={[styles.messageText, styles.loadingText]}>
        ...
      </ThemedText>
    </ThemedView>
  );
}

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
  codeBlock: {
    backgroundColor: "#1a1a1a",
    color: "#f5f5f5",
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    fontFamily: "monospace",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontStyle: "italic",
  },
  loadingText: {
    opacity: 0.7,
  },
});
