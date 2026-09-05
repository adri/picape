import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchIngredients } from '../components/Search/SearchIngredients';
import { SectionHeader } from '../components/Section/SectionHeader';
import Layout from '../constants/Layout';

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: Layout.tabBarHeight }}>
        <SectionHeader title="Zoeken" large />
        <View style={[styles.searchContainer]}>
          <SearchIngredients />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
  },
});
