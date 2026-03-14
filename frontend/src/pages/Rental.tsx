import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Button, Paper } from '@mui/material'
import * as movininTypes from 'movinin-types'
import { strings as commonStrings } from '@/lang/common'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import * as UnitService from '@/services/UnitService'

const Rental = () => {
  const { id } = useParams()
  const [unit, setUnit] = useState<movininTypes.Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    UnitService.getPublicUnit(id).then(setUnit).catch(() => setUnit(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><Backdrop text={commonStrings.LOADING} /></Layout>
  if (!unit) return <Layout><div style={{ padding: 24 }}>Unit not found.</div></Layout>

  const property = (unit as { property?: movininTypes.Property & { agency?: movininTypes.User } }).property
  const agency = property?.agency

  return (
    <Layout>
      <div style={{ padding: 24, maxWidth: 640 }}>
        <Typography variant="h5">{unit.name}</Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography>Rent: {unit.rent}</Typography>
          <Typography>Furnishing: {unit.furnishingStatus}</Typography>
          {property?.address && <Typography>Address: {property.address}</Typography>}
        </Paper>
        {agency && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>Contact manager</Typography>
            <Typography>{agency.fullName}</Typography>
            {agency.email && (
              <Button href={`mailto:${agency.email}`} variant="contained" size="small" sx={{ mt: 1, mr: 1 }}>
                Email
              </Button>
            )}
            {(agency as { phone?: string }).phone && (
              <Button href={`tel:${(agency as { phone?: string }).phone}`} variant="outlined" size="small" sx={{ mt: 1 }}>
                Call
              </Button>
            )}
          </Paper>
        )}
      </div>
    </Layout>
  )
}

export default Rental
