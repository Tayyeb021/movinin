import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as UnitService from '@/services/UnitService'
import * as PropertyService from '@/services/PropertyService'

const BTMSUnits = () => {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [units, setUnits] = useState<movininTypes.Unit[]>([])
  const [propertyName, setPropertyName] = useState('')
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user || !propertyId) return
    UnitService.getUnitsByProperty(propertyId)
      .then(setUnits)
      .catch(() => setUnits([]))
      .finally(() => setLoading(false))
    PropertyService.getProperty(propertyId).then((p) => setPropertyName(p?.name || '')).catch(() => {})
  }, [user, propertyId])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div style={{ padding: 24 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Units{propertyName ? ` - ${propertyName}` : ''}</Typography>
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate(`/btms-create-unit?propertyId=${propertyId}`)}>Add Unit</Button>
          {loading && <Typography>Loading...</Typography>}
          {!loading && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Furnishing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell><Button size="small" onClick={() => navigate(`/btms-update-unit/${u._id}`)}>{u.name}</Button></TableCell>
                      <TableCell>{u.rent}</TableCell>
                      <TableCell>{u.status}</TableCell>
                      <TableCell>{u.furnishingStatus}</TableCell>
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

export default BTMSUnits
