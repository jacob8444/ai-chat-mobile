import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function OpenSideBarButton({
  isSideBarOpen,
  setIsSideBarOpen,
}: {
  isSideBarOpen: boolean;
  setIsSideBarOpen: (isOpen: boolean) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => setIsSideBarOpen(!isSideBarOpen)}
      style={[
        styles.openSideBarButton,
        {
          transform: [{ rotate: isSideBarOpen ? "90deg" : "-90deg" }],
          marginLeft: isSideBarOpen ? 240 : 0,
        },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <Ionicons name="chevron-down" size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  openSideBarButton: {
    position: "absolute",
    overflow: "hidden",
    top: 60,
    left: 12,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(51, 51, 51, 1.0)",
  },
});
