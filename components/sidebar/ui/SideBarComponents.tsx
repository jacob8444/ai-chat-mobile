import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import {
  SideBarEmptyProps,
  SideBarFooterProps,
  SideBarSearchProps,
} from "@/constants/Types";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/shared/ui/ThemedText";

export function SideBarHeader({ title }: { title: string }) {
  return (
    <View style={styles.sideBarTopBar}>
      <ThemedText type="subtitle">{title}</ThemedText>
    </View>
  );
}

export function SideBarFooter({
  onSearchPress,
  onNewChat,
  isLoggedIn,
  onLogin,
}: SideBarFooterProps) {
  return (
    <View style={styles.sideBarBottomBar}>
      <TouchableOpacity style={styles.sideBarLoginButton} onPress={onLogin}>
        <ThemedText type="default">
          {isLoggedIn ? "Logged In" : "Login"}
        </ThemedText>
      </TouchableOpacity>
      <View style={styles.sideBarTopBarRight}>
        <TouchableOpacity
          style={styles.sideBarButton}
          activeOpacity={0.7}
          onPress={onSearchPress}
        >
          <Ionicons name="search-outline" size={20} color="#e0e0e0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBarButton, styles.marginLeft]}
          activeOpacity={0.7}
          onPress={onNewChat}
        >
          <Ionicons name="create-outline" size={20} color="#e0e0e0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SideBarSearch({
  value,
  onChangeText,
  onClose,
}: SideBarSearchProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          autoFocus
        />
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export function SideBarEmpty({ searchQuery }: SideBarEmptyProps) {
  return (
    <View style={styles.emptySearch}>
      <Ionicons name="search-outline" size={40} color="#555" />
      <ThemedText type="default" style={styles.emptySearchText}>
        {searchQuery
          ? `No chats found matching "${searchQuery}"`
          : "Start a new chat"}
      </ThemedText>
    </View>
  );
}

// Shared styles for all the side bar components
const styles = StyleSheet.create({
  sideBarTopBar: {
    width: "100%",
    height: 40,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  sideBarBottomBar: {
    width: "100%",
    height: 40,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  sideBarTopBarRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sideBarLoginButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
  },
  sideBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
  },
  marginLeft: {
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 20,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#e0e0e0",
    fontSize: 16,
  },
  emptySearch: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptySearchText: {
    color: "#888",
    marginTop: 12,
    textAlign: "center",
  },
});
