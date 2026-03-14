import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material'
import * as movininTypes from 'movinin-types'
import { strings as commonStrings } from '@/lang/common'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import * as TenantService from '@/services/TenantService'

const BTMSTenants = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [tenants, setTenants] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user) return
    TenantService.getTenants()
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Tenants</Typography>
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/btms-create-tenant')}>Assign tenant</Button>
          {loading && <Backdrop text={commonStrings.LOADING} />}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Move-in</TableCell>
                    <TableCell>Contract</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(tenants as { user?: { fullName?: string; email?: string }; unit?: { name?: string }; moveInDate?: string; contractStart?: string; contractEnd?: string }[]).map((t: unknown, i: number) => {
                    const row = t as { _id?: string; user?: { fullName?: string; email?: string }; unit?: { name?: string }; moveInDate?: string; contractStart?: string; contractEnd?: string }
                    return (
                      <TableRow key={row._id || i}>
                        <TableCell>{row.user?.fullName || row.user?.email || '-'}</TableCell>
                        <TableCell>{row.unit?.name || '-'}</TableCell>
                        <TableCell>{row.moveInDate ? new Date(row.moveInDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{row.contractStart && row.contractEnd ? `${new Date(row.contractStart).toLocaleDateString()} - ${new Date(row.contractEnd).toLocaleDateString()}` : '-'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Layout>
  )
}

export default BTMSTenants
