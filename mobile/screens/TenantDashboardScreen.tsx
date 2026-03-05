import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as movininTypes from ':movinin-types'

import Layout from '@/components/Layout'
import i18n from '@/lang/i18n'
import * as TenantService from '@/services/TenantService'
import Indicator from '@/components/Indicator'

const TenantDashboardScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'TenantDashboard'>) => {
  const isFocused = useIsFocused()
  const [data, setData] = useState<movininTypes.TenantDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFocused) return
    setLoading(true)
    TenantService.getTenantDashboard().then(setData).catch((e) => setError(e?.response?.data?.message ?? 'No active tenancy')).finally(() => setLoading(false))
  }, [isFocused])

  const onLoad = () => {}

  if (loading) return <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route} strict><Indicator style={styles.indicator} /></Layout>
  if (error) return <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route} strict><Text style={styles.error}>{error}</Text></Layout>
  if (!data) return <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route} strict><Text style={styles.error}>{i18n.t('INFO')}</Text></Layout>

  const unit = data.unit as movininTypes.Unit
  const property = data.property as movininTypes.Property

  return (
    <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route} strict>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>My tenancy</Text>
        <View style={styles.section}>
          <Text>Unit: {unit?.name}</Text>
          <Text>Rent: {unit?.rent}</Text>
          {property?.name && <Text>Property: {property.name}</Text>}
        </View>
        <Text style={styles.sectionTitle}>Rent history</Text>
        {(data.rentHistory || []).map((r: movininTypes.RentEntry) => <View key={r._id} style={styles.row}><Text>{r.period} - {r.amount} - {r.status}</Text></View>)}
        <Text style={styles.link} onPress={() => navigation.navigate('TenantMaintenance', {})}>Maintenance</Text>
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  indicator: { marginVertical: 10 },
  scroll: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { paddingVertical: 4 },
  error: { padding: 24 },
  link: { color: '#0D63C9', marginTop: 16 },
})

export default TenantDashboardScreen
