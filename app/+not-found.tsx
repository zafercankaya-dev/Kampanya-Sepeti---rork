import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Bulunamadı" }} />
      <View style={styles.container}>
        <Flame size={48} color={colors.textTertiary} />
        <Text style={styles.title}>Sayfa bulunamadı</Text>
        <Text style={styles.subtitle}>Aradığınız sayfa mevcut değil.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Anasayfaya Dön</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
