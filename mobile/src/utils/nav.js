import { useCallback } from "react";
import { StackActions, useNavigation } from "@react-navigation/native";

// Tap anyone's picture or name -> their profile (yours if it's you).
// Uses push so profile -> profile -> profile stacks naturally.
export function useOpenProfile() {
  const navigation = useNavigation();
  return useCallback(
    (u) => {
      if (!u || u.id === "me") navigation.dispatch(StackActions.push("Profile"));
      else navigation.dispatch(StackActions.push("Profile", { userId: u.id }));
    },
    [navigation]
  );
}
