// components/ChatListItem.tsx
import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Vibration,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SideBarListChatsProps } from "@/constants/Types";
import { ThemedText } from "@/components/shared/ui/ThemedText";

export function SideBarListChats({
  chat,
  onDelete,
  onSelect,
}: SideBarListChatsProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const swipeThreshold = -50;
  const itemHeight = 76;

  // Handles the resetting of the delete action (in case the user cancels the delete action)
  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setIsDragging(false);
    });
  };

  // Handles the showing of the delete button (in case the user swipes left)
  const showDeleteButton = () => {
    Vibration.vibrate(10);
    Animated.spring(translateX, {
      toValue: -100,
      useNativeDriver: true,
    }).start();
  };

  // TODO: Disable panResponder for toggling side bar when implemented
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDeleting,
      onMoveShouldSetPanResponder: () => !isDeleting,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.min(0, Math.max(gestureState.dx, -100));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = Math.abs(gestureState.vx);
        const isQuickSwipe = velocity > 0.5;

        if (
          gestureState.dx < swipeThreshold ||
          (isQuickSwipe && gestureState.dx < 0)
        ) {
          showDeleteButton();
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Alert window for user consent
  const handleDelete = () => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chat.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            resetPosition();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            Animated.timing(translateX, {
              toValue: -1000,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete(chat.id);
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.chatItemContainer, { height: itemHeight }]}>
      <Animated.View
        style={[styles.chatItem, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.chatContent}
          onPress={() => onSelect(chat.id)}
          activeOpacity={0.7}
        >
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <ThemedText type="default" style={styles.chatName}>
                {chat.name.length > 25
                  ? `${chat.name.substring(0, 25)}...`
                  : chat.name}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.chatTime}>
                {formatDate(chat.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.chatFooter}>
              <ThemedText
                type="subtitle"
                style={styles.chatMessage}
                numberOfLines={1}
              >
                {chat.messages.length === 0
                  ? "No messages yet"
                  : chat.messages[chat.messages.length - 1].content}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chatContent: {
    flex: 1,
    flexDirection: "row",
  },
  chatItemContainer: {
    position: "relative",
    overflow: "hidden",
  },
  chatItem: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#2d2d2d",
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
    zIndex: 1,
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    height: "100%",
    width: 100,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#e0e0e0",
  },
  chatTime: {
    color: "#888",
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    color: "#aaa",
    fontSize: 14,
    flex: 1,
  },
  confirmationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationText: {
    color: "white",
    fontSize: 14,
    marginBottom: 4,
  },
  cancelButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
