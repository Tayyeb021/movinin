import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as movininTypes from ':movinin-types'

import Layout from '@/components/Layout'
import i18n from '@/lang/i18n'
import * as UnitService from '@/services/UnitService'
import Indicator from '@/components/Indicator'

const PAGE_SIZE = 12

const RentalsScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'Rentals'>) => {
  const isFocused = useIsFocused()
  const [visible, setVisible] = useState(false)
  const [units, setUnits] = useState<movininTypes.Unit[]>([])
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUnits = async (pageNum: number) => {
    try {
      if (pageNum === 1) setVisible(false)
      const data = await UnitService.getPublicUnits(pageNum, PAGE_SIZE, {})
      const list = data?.resultData ?? []
      setUnits(list)
      setVisible(true)
    } catch {
      setUnits([])
      setVisible(true)
    }
    setRefreshing(false)
  }

  useEffect(() => {
    if (isFocused) fetchUnits(1)
  }, [isFocused])

  const onRefresh = () => {
    setRefreshing(true)
    fetchUnits(1)
  }

  const onLoad = () => {}

  return (
    <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route}>
      {!visible && <Indicator style={styles.indicator} />}
      {visible && (
        <FlatList
          data={units}
          keyExtractor={(item) => item._id ?? ''}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Rental', { id: item._id ?? '' })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rent}>Rent: {item.rent}</Text>
              <Text style={styles.status}>{item.furnishingStatus}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{i18n.t('EMPTY_PROPERTY_LIST')}</Text>}
        />
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  indicator: { marginVertical: 10 },
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: '600' },
  rent: { fontSize: 14, marginTop: 4 },
  status: { fontSize: 12, color: '#666', marginTop: 2 },
  empty: { padding: 24, textAlign: 'center' },
})

export default RentalsScreen
