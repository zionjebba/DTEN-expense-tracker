import { StyleSheet, Text, View } from "react-native";

export default function CategoryChart({
  categories,
  getCategoryTotal,
}: {
  categories: readonly string[];
  getCategoryTotal: (category: string) => number;
}) {
  const rows = categories
    .map((category) => ({ category, amount: getCategoryTotal(category) }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const maxAmount = Math.max(...rows.map((item) => item.amount), 1);

  return (
    <View style={styles.container}>
      {rows.map(({ category, amount }) => (
        <View key={category} style={styles.row}>
          <View style={styles.labels}>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.amount}>{`GH\u20B5 ${amount.toFixed(2)}`}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${(amount / maxAmount) * 100}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 17 },
  row: { gap: 8 },
  labels: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  category: { color: "#526052", fontSize: 12, fontWeight: "600" },
  amount: { color: "#27342A", fontSize: 12, fontWeight: "600" },
  track: {
    height: 6,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#EAECE4",
  },
  fill: { height: "100%", borderRadius: 4, backgroundColor: "#708D65" },
});
