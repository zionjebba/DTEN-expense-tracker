import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Expense } from "../types/expense";
import { getExpenses, updateExpenses } from "../utils/storage";
import Chart from "@/components/chart";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
] as const;

const currency = (amount: number) => `GH\u20B5 ${amount.toFixed(2)}`;

export default function HomeScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getExpenses()
        .then((storedExpenses) => {
          if (isActive) setExpenses(storedExpenses);
        })
        .catch(() => {
          if (isActive) {
            Alert.alert("Unable to load expenses", "Please try again.");
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const now = new Date();
  const thisMonthTotal = expenses.reduce((sum, expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      ? sum + expense.amount
      : sum;
  }, 0);
  const visibleExpenses = expenses
    .filter((expense) =>
      `${expense.title} ${expense.category}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getCategoryTotal = (category: string) =>
    expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

  const deleteExpense = (expense: Expense) => {
    Alert.alert("Delete expense?", `Remove "${expense.title}" from your list?`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await updateExpenses((current) =>
              current.filter((item) => item.id !== expense.id),
            );
            setExpenses(updated);
          } catch {
            Alert.alert("Unable to delete expense", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={visibleExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Expenses</Text>

            <View style={styles.balanceCard}>
              <View style={styles.balanceTopline}>
                <Text style={styles.balanceLabel}>TOTAL SPENDING</Text>
                <View style={styles.periodPill}>
                  <Text style={styles.periodText}>ALL TIME</Text>
                </View>
              </View>
              <Text style={styles.total}>{currency(total)}</Text>
              <Text style={styles.balanceNote}>
                {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} logged
              </Text>
              <View style={styles.monthSummary}>
                <Text style={styles.monthLabel}>THIS MONTH</Text>
                <Text style={styles.monthAmount}>{currency(thisMonthTotal)}</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>How Much Are You Spending?</Text>
                <Text style={styles.sectionNote}>By category</Text>
              </View>
            </View>
            <View style={styles.chartCard}>
              {expenses.length === 0 ? (
                <Text style={styles.chartEmpty}>
                  No spending recorded yet.
                </Text>
              ) : (
                <Chart
                  categories={categories}
                  getCategoryTotal={getCategoryTotal}
                />
              )}
            </View>

            <View style={[styles.sectionHeading, styles.transactionsHeading]}>
              <View>
                <Text style={styles.sectionTitle}>Recent activity</Text>
                <Text style={styles.sectionNote}>
                  {visibleExpenses.length} {visibleExpenses.length === 1 ? "expense" : "expenses"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                onPress={() => router.push("/add-expense")}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <TextInput
                accessibilityLabel="Search expenses"
                value={search}
                onChangeText={setSearch}
                placeholder="Search expenses"
                placeholderTextColor="#92958C"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={8}
                  onPress={() => setSearch("")}
                >
                  <Text style={styles.clearSearch}>Clear</Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{search.trim() ? "No matching expenses" : "No expenses yet"}</Text>
            <Text style={styles.emptyText}>
              {search.trim()
                ? "Try another title or category."
                : "Tap Add to record your first expense."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <View style={styles.categoryMark}>
              <Text style={styles.categoryInitial}>{item.category.charAt(0)}</Text>
            </View>
            <View style={styles.expenseInfo}>
              <Text numberOfLines={1} style={styles.expenseTitle}>
                {item.title}
              </Text>
              <Text style={styles.expenseMeta}>
                {item.category} | {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>{currency(item.amount)}</Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    router.push({ pathname: "/add-expense", params: { id: item.id } })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => deleteExpense(item)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F3EC" },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 44 },
  heading: {
    marginBottom: 22,
    color: "#202820",
    fontSize: 31,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  balanceCard: {
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#203B2D",
  },
  balanceTopline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "#C1CEBF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.35,
  },
  periodPill: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "#31513E",
  },
  periodText: { color: "#E2E9DE", fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  total: {
    marginTop: 21,
    color: "#F8F6EB",
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -0.8,
  },
  balanceNote: { marginTop: 7, color: "#C1CEBF", fontSize: 13 },
  monthSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#42604B" },
  monthLabel: { color: "#C1CEBF", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  monthAmount: { color: "#F8F6EB", fontSize: 14, fontWeight: "600" },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 12,
  },
  sectionTitle: { color: "#263129", fontSize: 19, fontWeight: "700", letterSpacing: -0.3 },
  sectionNote: { marginTop: 4, color: "#858A80", fontSize: 12 },
  chartCard: {
    padding: 17,
    borderRadius: 16,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "#E9E8DE",
  },
  chartEmpty: { paddingVertical: 8, color: "#858A80", fontSize: 13 },
  transactionsHeading: { marginTop: 29, marginBottom: 7 },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#D9E3D0",
  },
  addButtonText: { color: "#294633", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.72 },
  searchBox: { minHeight: 46, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: "#E6E5DC", borderRadius: 12, backgroundColor: "#FFFEFA" },
  searchInput: { flex: 1, paddingVertical: 10, color: "#27342A", fontSize: 14 },
  clearSearch: { paddingLeft: 8, color: "#59765A", fontSize: 12, fontWeight: "600" },
  emptyState: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E3DA",
  },
  emptyTitle: { color: "#334237", fontSize: 15, fontWeight: "600" },
  emptyText: { marginTop: 5, color: "#858A80", fontSize: 13 },
  transaction: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  separator: { height: 1, backgroundColor: "#E4E3DA" },
  categoryMark: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E9DE",
  },
  categoryInitial: { color: "#405943", fontSize: 15, fontWeight: "700" },
  expenseInfo: { flex: 1, paddingRight: 8 },
  expenseTitle: { color: "#283129", fontSize: 14, fontWeight: "600" },
  expenseMeta: { marginTop: 5, color: "#858A80", fontSize: 11 },
  expenseRight: { alignItems: "flex-end" },
  expenseAmount: { color: "#283129", fontSize: 13, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 13, marginTop: 5 },
  editText: { color: "#59765A", fontSize: 11, fontWeight: "600" },
  deleteText: { color: "#A55C50", fontSize: 11, fontWeight: "600" },
});
