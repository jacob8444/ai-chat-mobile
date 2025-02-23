import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function OpenChatButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/index")}
      style={[styles.openChatButton]}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <Ionicons name="settings-outline" size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  openChatButton: {
    position: "absolute",
    overflow: "hidden",
    top: 60,
    right: 12,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(51, 51, 51, 1.0)",
  },
});
