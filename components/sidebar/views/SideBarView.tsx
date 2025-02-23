import { BlurView } from "expo-blur";
import {
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Chat, SideBarProps } from "@/constants/Types";
import {
  createNewChat,
  deleteChat,
  filterChats,
  loadChats,
} from "@/helpers/general";
import {
  SideBarEmpty,
  SideBarFooter,
  SideBarHeader,
  SideBarSearch,
} from "../ui/SideBarComponents";
import { SideBarListChats } from "../ui/SideBarListChats";

const HEIGHT = Dimensions.get("window").height;

export default function SideBarView({
  isSideBarOpen,
  setIsSideBarOpen,
  onChatSelect,
}: SideBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChats().then((result) => setChats(result));
  }, [chats]);

  const filteredChats: Chat[] = filterChats(chats, searchQuery);

  const handleDeleteChat = (chatId: string, chats: Chat[]) => {
    deleteChat(chatId, chats).then((result) => {
      setChats(result);
      if (result.length === 0) onChatSelect(undefined);
      else onChatSelect(result[0]);
    });
  };

  const handleCreateNewChat = (chats: Chat[]) => {
    createNewChat(chats).then((result) => {
      setChats(result);
      onChatSelect(result[0]);
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isSideBarOpen ? 0 : -300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isSideBarOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSideBarOpen]);

  const handleSearchClose = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  const handleSearchOpen = () => {
    setIsSearching(true);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sideBar,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.sideBarContent}>
          <SideBarHeader title="ChatBot" />
          <FlatList
            data={filteredChats}
            renderItem={({ item }) => (
              <SideBarListChats
                chat={item}
                onDelete={() => handleDeleteChat(item.id, chats)}
                onSelect={() => {
                  onChatSelect(item);
                  setIsSideBarOpen(false);
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <SideBarEmpty searchQuery={searchQuery} />
            )}
          />
          {isSearching ? (
            <SideBarSearch
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClose={handleSearchClose}
            />
          ) : (
            <SideBarFooter
              onSearchPress={handleSearchOpen}
              onNewChat={() => {
                handleCreateNewChat(chats);
                setIsSideBarOpen(false);
              }}
            />
          )}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  sideBar: {
    position: "absolute",
    width: 300,
    height: HEIGHT,
    zIndex: 99,
    backgroundColor: "rgba(45, 45, 45, 0.6)",
    overflow: "hidden",
  },
  sideBarContent: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
});
