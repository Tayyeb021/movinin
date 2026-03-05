import React, { useState, useEffect } from 'react'
import { TextField, Button, MenuItem } from '@mui/material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import * as MaintenanceService from '@/services/MaintenanceService'

const TenantMaintenance = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [tickets, setTickets] = useState<movininTypes.MaintenanceTicket[]>([])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<movininTypes.MaintenancePriority>(movininTypes.MaintenancePriority.Medium)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user) return
    MaintenanceService.getMyTickets().then(setTickets).catch(() => setTickets([]))
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await MaintenanceService.createTicket({ category, description, priority })
      setSubmitted(true)
      setCategory('')
      setDescription('')
      MaintenanceService.getMyTickets().then(setTickets)
    } catch (err) {
      // ignore
    }
    setLoading(false)
  }

  return (
    <Layout onLoad={onLoad} strict>
      <div style={{ padding: 24 }}>
        <h2>Maintenance requests</h2>
        <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 24 }}>
          <TextField fullWidth margin="normal" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <TextField fullWidth margin="normal" multiline rows={3} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <TextField fullWidth select margin="normal" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as movininTypes.MaintenancePriority)}>
            <MenuItem value={movininTypes.MaintenancePriority.Low}>Low</MenuItem>
            <MenuItem value={movininTypes.MaintenancePriority.Medium}>Medium</MenuItem>
            <MenuItem value={movininTypes.MaintenancePriority.High}>High</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" disabled={loading}>Submit</Button>
        </form>
        {submitted && <p>Request submitted.</p>}
        <h3>My tickets</h3>
        <ul>
          {tickets.map((t) => (
            <li key={t._id}>{t.category} - {t.description?.slice(0, 50)} - {t.status}</li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

export default TenantMaintenance
