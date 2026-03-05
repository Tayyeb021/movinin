import React, { useState, useEffect } from 'react'
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import * as TenantService from '@/services/TenantService'

const TenantDashboard = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [data, setData] = useState<movininTypes.TenantDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user) return
    TenantService.getTenantDashboard().then(setData).catch((err) => setError(err?.response?.data?.message || 'No active tenancy')).finally(() => setLoading(false))
  }, [user])

  if (!user) return null
  if (loading) return <Layout onLoad={onLoad} strict><div style={{ padding: 24 }}>Loading...</div></Layout>
  if (error) return <Layout onLoad={onLoad} strict><div style={{ padding: 24 }}>{error}</div></Layout>
  if (!data) return <Layout onLoad={onLoad} strict><div style={{ padding: 24 }}>No data</div></Layout>

  const unit = data.unit as movininTypes.Unit
  const property = data.property as movininTypes.Property

  return (
    <Layout onLoad={onLoad} strict>
      <div style={{ padding: 24 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>My tenancy</Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Unit: {unit?.name}</Typography>
          <Typography>Rent: {unit?.rent}</Typography>
          {property?.name && <Typography>Property: {property.name}</Typography>}
        </Paper>
        <Typography variant="h6">Rent history</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.rentHistory || []).map((r: movininTypes.RentEntry) => (
                <TableRow key={r._id}>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Layout>
  )
}

export default TenantDashboard
