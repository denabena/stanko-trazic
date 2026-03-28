/**
 * Firestore + anonymous auth are **disabled** for now (persistence and accounts optional).
 * Restore: wire `firebase/app`, `firebase/auth`, and `firebase/firestore` again and replace
 * the stubs below with the previous implementation (git history).
 */
import type { FirebaseApp } from "firebase/app";
import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

import type {
  ApartmentEntryStepState,
  FirestoreComparisonDocument,
  TransitPriorityQuizAnswers,
} from "@/lib/types";

export function getFirebaseApp(): FirebaseApp | null {
  return null;
}

export function getFirestoreDb(): Firestore | null {
  return null;
}

export async function ensureAnonymousFirebaseUser(): Promise<User | null> {
  return null;
}

export async function saveZagrebComparisonForCurrentUser(params: {
  apartmentEntry: ApartmentEntryStepState;
  quiz: TransitPriorityQuizAnswers;
}): Promise<string | null> {
  void params;
  return null;
}

export async function listZagrebComparisonsForCurrentUser(): Promise<
  FirestoreComparisonDocument[] | null
> {
  return null;
}
