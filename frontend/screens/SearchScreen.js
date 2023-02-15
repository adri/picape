import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { SearchIngredients } from '../components/Search/SearchIngredients';
import { SectionHeader } from '../components/Section/SectionHeader';
import { StyleSheet, View } from 'react-native';

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <SectionHeader title="Zoeken" />
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
