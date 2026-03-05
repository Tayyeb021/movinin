import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, Linking } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as movininTypes from ':movinin-types'

import Layout from '@/components/Layout'
import i18n from '@/lang/i18n'
import * as UnitService from '@/services/UnitService'
import Indicator from '@/components/Indicator'
import Button from '@/components/Button'

const RentalScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'Rental'>) => {
  const isFocused = useIsFocused()
  const [unit, setUnit] = useState<movininTypes.Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFocused || !route.params?.id) return
    setLoading(true)
    UnitService.getPublicUnit(route.params.id)
      .then(setUnit)
      .catch(() => setUnit(null))
      .finally(() => setLoading(false))
  }, [isFocused, route.params?.id])

  const onLoad = () => {}

  const property = unit && typeof (unit as { property?: { address?: string; agency?: movininTypes.User } }).property === 'object'
    ? (unit as { property?: { address?: string; agency?: movininTypes.User } }).property
    : null
  const agency = property?.agency as movininTypes.User | undefined

  return (
    <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route}>
      {loading && <Indicator style={styles.indicator} />}
      {!loading && !unit && <Text style={styles.empty}>{i18n.t('INFO')}</Text>}
      {!loading && unit && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.title}>{unit.name}</Text>
          <View style={styles.section}>
            <Text>{i18n.t('RENT')}: {unit.rent}</Text>
            <Text>Security deposit: {unit.securityDeposit}</Text>
            {unit.size && <Text>Size: {unit.size}</Text>}
            <Text>Furnishing: {unit.furnishingStatus}</Text>
            {property?.address && <Text>Address: {property.address}</Text>}
          </View>
          {agency && (
            <View style={styles.section}>
              <Text>Contact: {agency.fullName}</Text>
              {agency.email && (
                <Button style={styles.btn} label="Email" onPress={() => Linking.openURL(`mailto:${agency.email}`)} />
              )}
              {agency.phone && (
                <Button style={styles.btn} label="Call" onPress={() => Linking.openURL(`tel:${agency.phone}`)} />
              )}
            </View>
          )}
        </ScrollView>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  indicator: { marginVertical: 10 },
  scroll: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  section: { marginBottom: 24 },
  empty: { padding: 24 },
  btn: { marginTop: 8 },
})

export default RentalScreen
