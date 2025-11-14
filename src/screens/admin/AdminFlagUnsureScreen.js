import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ADMIN_FLAG_REVIEW } from '../../navigation/routes';
import api from '../../../services/api';

const toPercent = (score) => `${Math.round((Number(score) || 0) * 100)}%`;

export default function AdminFlagUnsureScreen() {
  const navigation = useNavigation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFlagged = useCallback(async () => {
    setLoading(true);
    try {
      const pageSize = 200;
      let page = 1;
      let all = [];

      while (true) {
        const resp = await api.get('/api/admin/observations', {
          params: {
            status: 'pending',
            // we will fix auto_flagged in the next section
            page,
            page_size: pageSize,
          },
        });

        const batch = Array.isArray(resp.data?.data) ? resp.data.data : [];
        all = all.concat(batch);

        const nextPage = resp.data?.next_page;
        const haveMore = nextPage ? true : batch.length === pageSize;

        if (!haveMore) break;
        page = nextPage || (page + 1);
      }

      setRows(all);
    } catch (e) {
      console.log('[FlagUnsure] fetch error', e?.response?.status, e?.response?.data);
      Alert.alert('Error', 'Failed to load flagged observations');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      // wrap to respect the isActive flag, in case the screen blurs mid-request
      (async () => {
        if (!isActive) return;
        await loadFlagged();
      })();

      return () => {
        isActive = false;
      };
    }, [loadFlagged])
  );
        
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Flag Unsure Queue</Text>
      <Text style={styles.headerSubtitle}>
        All pending plant identifications awaiting manual review.
      </Text>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cellWide, styles.headerText]}>Plant</Text>
          <Text style={[styles.cell, styles.headerText, styles.cellScoreHeader]}>Score</Text>
          <Text style={[styles.cellAction, styles.headerText, styles.cellActionHeader]}>Action</Text>
        </View>

        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.observation_id)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.cellWide}>
                <Text style={styles.plantText}>{item.plant_name || 'Unknown'}</Text>
                <Text style={styles.metaText}>
                  {new Date(item.submitted_at).toLocaleString()}
                </Text>
              </View>
              <Text style={[styles.cell, styles.cellScoreValue]}>
                {toPercent(item.confidence)}
              </Text>
              <View style={styles.cellAction}>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => navigation.navigate(ADMIN_FLAG_REVIEW, { observation: item })}
                >
                  <Text style={styles.reviewText}>Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
    marginBottom: 16,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  cell: {
    flex: 0.9,
    fontSize: 13,
    color: '#334155',
    textAlign: 'left',
  },
  cellWide: {
    flex: 1.8,
  },
  cellAction: {
    width: 120,
    alignItems: 'flex-end',
  },
  headerText: {
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  plantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  reviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cellScoreHeader: {
    textAlign: 'right',
    paddingRight: 12,
  },
  cellScoreValue: {
    textAlign: 'right',
    paddingRight: 12,
  },
  cellActionHeader: {
    textAlign: 'right',
    paddingRight: 4,
  },
});
