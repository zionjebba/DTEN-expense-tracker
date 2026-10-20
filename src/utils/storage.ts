import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Expense } from "../types/expense";

const STORAGE_KEY = "expense-tracker-expenses";

export async function getExpenses(): Promise<Expense[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const parsed: unknown = JSON.parse(data);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved expenses have an invalid format.");
  }
  return parsed as Expense[];
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

let updateQueue = Promise.resolve();

export function updateExpenses(
  update: (expenses: Expense[]) => Expense[],
): Promise<Expense[]> {
  const operation = updateQueue.then(async () => {
    const expenses = await getExpenses();
    const updated = update(expenses);
    await saveExpenses(updated);
    return updated;
  });

  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
