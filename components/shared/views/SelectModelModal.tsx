import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../ui/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { ModelProps, SelectModelModalProps } from "@/constants/Types";

export default function SelectModelModal({
  isModelPickerVisible,
  setIsModelPickerVisible,
  availableModels,
  selectedModel,
  selectModel,
  styles,
}: SelectModelModalProps) {
  return (
    <Modal
      visible={isModelPickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsModelPickerVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsModelPickerVisible(false)}
      >
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>Select Model</ThemedText>
          <ScrollView style={styles.modelList}>
            {availableModels.map((model) => (
              <TouchableOpacity
                key={model.alias}
                style={[
                  styles.modelOption,
                  selectedModel[0] === model.name &&
                    selectedModel[1] === model.alias &&
                    styles.selectedModelOption,
                ]}
                onPress={() => selectModel([model.name, model.alias])}
              >
                <View style={styles.modelOptionContent}>
                  <ThemedText
                    style={[
                      styles.modelOptionText,
                      selectedModel[0] === model.name &&
                        selectedModel[1] === model.alias &&
                        styles.selectedModelText,
                    ]}
                  >
                    {model.name}
                  </ThemedText>
                  <View style={styles.modelIcons}>
                    {model.supportsReasoning && (
                      <View style={styles.modelFeature}>
                        <Ionicons
                          name="bulb-outline"
                          size={16}
                          color="#db2777"
                        />
                      </View>
                    )}
                    {model.supportsWebSearch && (
                      <View style={styles.modelFeature}>
                        <Ionicons
                          style={styles.modelFeature}
                          name="globe-outline"
                          size={16}
                          color="#3b82f6"
                        />
                      </View>
                    )}
                    {model.supportsImageUpload && (
                      <View style={styles.modelFeature}>
                        <Ionicons
                          style={styles.modelFeature}
                          name="eye-outline"
                          size={16}
                          color="#3b82f6"
                        />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    marginBottom: 12,
    color: "#f0f0f0",
    textAlign: "center",
  },
  modelList: {
    maxHeight: 300,
  },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedModelOption: {
    backgroundColor: "rgba(219, 39, 119, 0.15)",
  },
  modelOptionText: {
    fontSize: 16,
    color: "#e0e0e0",
  },
  selectedModelText: {
    color: "#f5f5f5",
    fontWeight: "500",
  },
  modelOptionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 8,
  },
  modelIcons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  modelFeature: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2a2a2a",
  },
});
