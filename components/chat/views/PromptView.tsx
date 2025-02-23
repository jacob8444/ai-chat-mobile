import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedView } from "../../shared/ui/ThemedView";
import { ThemedText } from "../../shared/ui/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { availableModels } from "@/constants/Data";
import { PromptViewProps } from "@/constants/Types";
import { newChatMessage } from "@/helpers/general";
import FileAttachmentModal from "../ui/FileAttachmentModal";

export default function PromptView({ onSubmit, chat }: PromptViewProps) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [isWaiting, setIsWaiting] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState([
    "Gemini 2.0 Flash Lite",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
  ]);
  const [isModelPickerVisible, setIsModelPickerVisible] = useState(false);
  const [isFileAttachmentVisible, setIsFileAttachmentVisible] = useState(false);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const animatedHeight = useRef(new Animated.Value(40)).current;

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.max(40, Math.min(120, height));
    setInputHeight(newHeight);
    Animated.timing(animatedHeight, {
      toValue: newHeight,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const selectModel = (model: string[]) => {
    setSelectedModel(model);
    setIsModelPickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const updatedChat = await newChatMessage(
        chat?.id,
        prompt,
        chat?.messages,
        selectedModel[0],
        useWebSearch
      );
      onSubmit(prompt, selectedImage, updatedChat, selectedModel[1]);
      setSelectedImage(undefined);
      setPrompt("");
    } catch (error) {
      console.error("Error submitting prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.container}>
        {/** Displays SelectedImage */}
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <TouchableOpacity
              onPress={() => setIsFullscreenVisible(true)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                style={styles.selectedImage}
              />
              <TouchableOpacity
                style={styles.deleteImageButton}
                onPress={() => setSelectedImage(undefined)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* Fullscreen Image Modal */}
        <Modal
          visible={isFullscreenVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFullscreenVisible(false)}
        >
          <TouchableOpacity
            style={styles.fullscreenOverlay}
            activeOpacity={1}
            onPress={() => setIsFullscreenVisible(false)}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>

        {/** Animated Input Container */}
        <Animated.View
          style={[styles.inputContainer, { height: animatedHeight }]}
        >
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Type your message here..."
            placeholderTextColor="#8e8e8e"
            multiline
            onContentSizeChange={handleContentSizeChange}
            returnKeyType="default"
          />
        </Animated.View>

        {/** Bottom Row Section */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowLeft}>
            <TouchableOpacity
              style={styles.selectModelButton}
              onPress={() => setIsModelPickerVisible(true)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.modelButtonText}>
                {selectedModel[0]}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color="#e0e0e0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.webSearchButton,
                useWebSearch ? { backgroundColor: "#db2777" } : {},
              ]}
              onPress={() => setUseWebSearch(!useWebSearch)}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={20} color="#e0e0e0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachFileButton}
              activeOpacity={0.7}
              onPress={() => setIsFileAttachmentVisible(true)}
            >
              <Ionicons
                name="attach"
                style={styles.attachFileIcon}
                size={20}
                color="#e0e0e0"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              {
                backgroundColor: prompt.trim() ? "#db2777" : "#87446c",
              },
            ]}
            disabled={!prompt.trim() || isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                style={{
                  transform: [{ rotate: isWaiting ? "0deg" : "-45deg" }],
                }}
                name={isWaiting ? "stop" : "send-outline"}
                size={18}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
        <FileAttachmentModal
          isVisible={isFileAttachmentVisible}
          onClose={() => {
            setIsFileAttachmentVisible(false);
          }}
          onSelectFile={(fileType: string, base64Data: string | undefined) => {
            setSelectedImage(base64Data);
          }}
        />
        {/* Model Selection Modal TODO: Move to separate modal file */}
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
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#2d2d2d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedImageContainer: {
    borderRadius: 12,
    width: 60,
    overflow: "hidden",
    backgroundColor: "#333333",
    marginBottom: 8,
    position: "relative",
  },
  selectedImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
  },
  deleteImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#2d2d2d",
    borderColor: "#2d2d2d",
    overflow: "hidden",
  },
  input: {
    padding: 12,
    color: "#f5f5f5",
    fontSize: 16,
    textAlignVertical: "top",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  bottomRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectModelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#333333",
  },
  modelButtonText: {
    fontSize: 14,
    color: "#e0e0e0",
  },
  webSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
  },
  attachFileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
  },
  attachFileIcon: {
    transform: [{ rotate: "45deg" }],
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#db2777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
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
