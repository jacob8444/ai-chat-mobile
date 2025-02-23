import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  color?: string;
};

export function ThemedView({ style, color, ...otherProps }: ThemedViewProps) {
  const backgroundColor = color || "transparent";

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
