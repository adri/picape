import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchIngredients } from '../components/Search/SearchIngredients';
import { SectionHeader } from '../components/Section/SectionHeader';
import { contentColumn } from '../constants/Layout';

export default function SearchScreen() {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  // The result list is the scroller, so the field stays put while results
  // move. Wrapping it in a ScrollView put a virtualized list inside a plain
  // ScrollView on the same axis, which breaks the list's windowing.
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[contentColumn, { flex: 1 }]}>
        <SectionHeader title="Zoeken" large />
        <View style={styles.searchContainer}>
          <SearchIngredients scrollRef={scrollRef} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
});
