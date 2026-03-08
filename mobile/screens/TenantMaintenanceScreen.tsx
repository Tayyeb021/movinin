import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as movininTypes from 'movinin-types'

import Layout from '@/components/Layout'
import * as UserService from '@/services/UserService'
import * as MaintenanceService from '@/services/MaintenanceService'
import Indicator from '@/components/Indicator'
import Button from '@/components/Button'
import TextInput from '@/components/TextInput'

const TenantMaintenanceScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'TenantMaintenance'>) => {
  const isFocused = useIsFocused()
  const [tickets, setTickets] = useState<movininTypes.MaintenanceTicket[]>([])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<movininTypes.MaintenancePriority>(movininTypes.MaintenancePriority.Medium)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isFocused) return
    MaintenanceService.getMyTickets().then(setTickets).catch(() => setTickets([]))
  }, [isFocused, submitted])

  const onLoad = () => {}

  const handleSubmit = async () => {
    if (!category.trim() || !description.trim()) return
    setLoading(true)
    try {
      await MaintenanceService.createTicket({ category, description, priority })
      setSubmitted(true)
      setCategory('')
      setDescription('')
    } catch {
      // ignore
    }
    setLoading(false)
  }

  return (
    <Layout style={styles.master} onLoad={onLoad} navigation={navigation} route={route} strict>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Maintenance requests</Text>
        <TextInput label="Category" value={category} onChangeText={setCategory} />
        <TextInput label="Description" value={description} onChangeText={setDescription} />
        <Button label="Submit" onPress={handleSubmit} style={styles.btn} />
        {submitted && <Text style={styles.msg}>Request submitted.</Text>}
        <Text style={styles.sectionTitle}>My tickets</Text>
        {tickets.map((t) => (
          <View key={t._id} style={styles.row}>
            <Text>{t.category} - {t.description?.slice(0, 40)} - {t.status}</Text>
          </View>
        ))}
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  btn: { marginVertical: 12 },
  msg: { color: 'green', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  row: { paddingVertical: 4 },
})

export default TenantMaintenanceScreen
