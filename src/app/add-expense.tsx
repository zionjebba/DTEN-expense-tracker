import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Expense, ExpenseCategory } from "../types/expense";
import { getExpenses, updateExpenses } from "../utils/storage";

const categories: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isActive = true;
    const loadExpense = async () => {
      try {
        const expenses = await getExpenses();
        const expense = expenses.find((item) => item.id === id);

        if (!isActive) return;
        if (!expense) {
          Alert.alert(
            "Expense not found",
            "This expense may have been deleted.",
          );
          router.back();
          return;
        }

        setTitle(expense.title);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setDate(new Date(expense.date));
      } catch {
        if (isActive) {
          Alert.alert("Unable to load expense", "Please try again.");
        }
      }
    };

    void loadExpense();
    return () => {
      isActive = false;
    };
  }, [id, router]);

  const handleSave = async () => {
    const cleanTitle = title.trim();
    const numericAmount = Number(amount);

    if (!cleanTitle) {
      Alert.alert("Missing title", "Enter what you spent money on.");
      return;
    }

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount.");
      return;
    }

    const expense: Expense = {
      id: id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: cleanTitle,
      amount: numericAmount,
      category,
      date: date.toISOString(),
    };

    try {
      await updateExpenses((expenses) =>
        id
          ? (() => {
              if (!expenses.some((item) => item.id === id)) {
                throw new Error("Expense not found");
              }
              return expenses.map((item) => (item.id === id ? expense : item));
            })()
          : [...expenses, expense],
      );
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    } catch {
      Alert.alert(
        "Unable to save expense",
        "The expense could not be saved. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SPENDING</Text>
        <Text style={styles.heading}>
          {id ? "Edit expense" : "New expense"}
        </Text>
        <Text style={styles.intro}>Enter the amount, category and date.</Text>

        <Text style={styles.label}>What did you spend on?</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Lunch"
          placeholderTextColor="#9A9D93"
          style={styles.input}
        />

        <Text style={styles.label}>Amount</Text>

        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#9A9D93"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>

        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.selectedCategory,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item }}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>

        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);

              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {id ? "Save changes" : "Save expense"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F3EC",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 48,
  },
  eyebrow: {
    color: "#72776D",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
  },
  heading: {
    marginTop: 7,
    color: "#202820",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  intro: {
    marginTop: 6,
    color: "#858A80",
    fontSize: 14,
    marginBottom: 18,
  },
  label: {
    marginTop: 19,
    marginBottom: 9,
    color: "#465247",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.25,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E6E5DC",
    backgroundColor: "#FFFEFA",
    color: "#27342A",
    fontSize: 16,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E5DC",
    backgroundColor: "#FFFEFA",
  },
  selectedCategory: {
    borderColor: "#31513E",
    backgroundColor: "#DDE7D8",
  },
  categoryText: {
    color: "#697267",
    fontSize: 13,
  },
  selectedCategoryText: {
    color: "#294633",
    fontWeight: "700",
  },
  dateButton: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E6E5DC",
    backgroundColor: "#FFFEFA",
  },
  dateText: {
    fontSize: 16,
    color: "#27342A",
  },
  saveButton: {
    minHeight: 54,
    marginTop: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#203B2D",
  },
  pressed: { opacity: 0.75 },
  saveButtonText: {
    color: "#F8F6EB",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
