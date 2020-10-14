import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { SearchIngredients } from "../components/Search/SearchIngredients";
import { SectionHeader } from "../components/Section/SectionHeader";

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <SectionHeader title="Zoeken" />
        <SearchIngredients />
      </ScrollView>
    </SafeAreaView>
  );
}
