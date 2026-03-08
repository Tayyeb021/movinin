import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Button, Paper } from '@mui/material'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as UnitService from '@/services/UnitService'

const Rental = () => {
  const { id } = useParams()
  const [unit, setUnit] = useState<movininTypes.Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    UnitService.getPublicUnit(id).then(setUnit).catch(() => setUnit(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><div style={{ padding: 24 }}>Loading...</div></Layout>
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
          <Typography sx={{ mt: 2 }}>
            Contact: {agency.fullName}
            {agency.email && <Button href={`mailto:${agency.email}`} size="small" sx={{ ml: 1 }}>Email</Button>}
          </Typography>
        )}
      </div>
    </Layout>
  )
}

export default Rental
