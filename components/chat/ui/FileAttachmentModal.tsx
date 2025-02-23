import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { FileTypeProps } from "@/constants/Types";
import { ThemedText } from "@/components/shared/ui/ThemedText";

interface FileAttachmentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFile: (fileType: string, base64Data?: string) => void;
}

const fileTypes: FileTypeProps[] = [
  {
    name: "Image",
    icon: "image-outline",
    type: "image",
    isAllowed: true,
  },
  {
    name: "Document",
    icon: "document-outline",
    type: "document",
    isAllowed: false,
  },
  {
    name: "Audio",
    icon: "musical-note-outline",
    type: "audio",
    isAllowed: false,
  },
  {
    name: "Video",
    icon: "videocam-outline",
    type: "video",
    isAllowed: false,
  },
];

export default function FileAttachmentModal({
  isVisible,
  onClose,
  onSelectFile,
}: FileAttachmentModalProps) {
  const handleFilePick = async (fileType: string) => {
    try {
      let result;
      if (fileType === "image") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          alert("Permission to access media library is required!");
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const base64Data = result.assets[0].base64 ?? undefined;
          onSelectFile(fileType, base64Data);
          onClose();
        }
      } else {
        // Handle other file types if needed
        onSelectFile(fileType);
        onClose();
      }
    } catch (error) {
      console.error("Error picking file:", error);
      alert("Error picking file. Please try again.");
    }
  };
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>Attach File</ThemedText>
          <ScrollView style={styles.fileTypeList}>
            {fileTypes
              .filter((fileType) => fileType.isAllowed)
              .map((fileType) => (
                <TouchableOpacity
                  key={fileType.type}
                  style={styles.fileTypeOption}
                  onPress={() => handleFilePick(fileType.type)}
                >
                  <View style={styles.fileTypeContent}>
                    <View style={styles.fileTypeIcon}>
                      <Ionicons
                        name={fileType.icon}
                        size={24}
                        color="#db2777"
                      />
                    </View>
                    <ThemedText style={styles.fileTypeName}>
                      {fileType.name}
                    </ThemedText>
                  </View>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color="#8e8e8e"
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "#2d2d2d",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#f0f0f0",
    textAlign: "center",
  },
  fileTypeList: {
    maxHeight: 300,
  },
  fileTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#333333",
  },
  fileTypeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(219, 39, 119, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileTypeName: {
    fontSize: 16,
    color: "#e0e0e0",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#404040",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#e0e0e0",
    fontWeight: "500",
  },
});
