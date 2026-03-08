import React, { useState, useEffect } from 'react'
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as MaintenanceService from '@/services/MaintenanceService'

const BTMSMaintenance = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [tickets, setTickets] = useState<movininTypes.MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user) return
    MaintenanceService.getTickets().then(setTickets).catch(() => setTickets([])).finally(() => setLoading(false))
  }, [user])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div style={{ padding: 24 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Maintenance Tickets</Typography>
          {loading && <Typography>Loading...</Typography>}
          {!loading && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{t.category}</TableCell>
                      <TableCell>{t.description?.slice(0, 50)}</TableCell>
                      <TableCell>{t.priority}</TableCell>
                      <TableCell>{t.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      )}
    </Layout>
  )
}

export default BTMSMaintenance
