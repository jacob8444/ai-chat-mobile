import { Ionicons } from "@expo/vector-icons";

export interface Message {
  id: string;
  content: string;
  role: "user" | "ai";
  createdAt: string;
  isStreaming?: boolean;
}

export interface StreamingMessage extends Message {
  isStreaming: true;
  content: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatContextType {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  isSideBarOpen: boolean;
  setIsSideBarOpen: (isOpen: boolean) => void;
  isWaiting: boolean;
  setIsWaiting: (isWaiting: boolean) => void;
  handleNewMessage: (content: string) => Promise<void>;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
}

export interface SideBarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: (isOpen: boolean) => void;
  onChatSelect: (chat: Chat | undefined) => void;
}

export interface SideBarListChatsProps {
  chat: Chat;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export interface SideBarFooterProps {
  onSearchPress: () => void;
  onNewChat: () => void;
  isLoggedIn?: boolean;
  onLogin?: () => void;
}

export interface SideBarSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export interface SideBarEmptyProps {
  searchQuery: string;
}

export interface ChatViewProps {
  chat: Chat | null;
}

export interface ChatMessageProps {
  message: Message;
  index: number;
}

export interface PromptViewProps {
  onSubmit: (
    content: string,
    selectedImage: string | undefined,
    chat: Chat,
    model: string
  ) => Promise<void>;
  chat: Chat | null;
}

export interface ModelProps {
  name: string;
  supportsReasoning: boolean;
  supportsWebSearch: boolean;
  supportsImageUpload: boolean;
  alias: string;
}

export interface FileTypeProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: string;
  isAllowed: boolean;
}
