import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TextField, Button, MenuItem } from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as UnitService from '@/services/UnitService'

const CreateUnit = () => {
  const [searchParams] = useSearchParams()
  const propertyId = searchParams.get('propertyId') || ''
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [name, setName] = useState('')
  const [rent, setRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [furnishingStatus, setFurnishingStatus] = useState(movininTypes.FurnishingStatus.Unfurnished)
  const [status, setStatus] = useState(movininTypes.UnitStatus.Vacant)
  const [loading, setLoading] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId) return
    setLoading(true)
    try {
      await UnitService.createUnit({
        property: propertyId,
        name,
        rent: Number(rent),
        securityDeposit: Number(securityDeposit),
        furnishingStatus,
        status,
      })
      navigate(`/btms-units/${propertyId}`)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div style={{ padding: 24, maxWidth: 480 }}>
          <h2>Add Unit</h2>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="Unit name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField fullWidth margin="normal" type="number" label="Rent" value={rent} onChange={(e) => setRent(e.target.value)} required />
            <TextField fullWidth margin="normal" type="number" label="Security deposit" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} required />
            <TextField fullWidth select margin="normal" label="Furnishing" value={furnishingStatus} onChange={(e) => setFurnishingStatus(e.target.value as movininTypes.FurnishingStatus)}>
              <MenuItem value={movininTypes.FurnishingStatus.Unfurnished}>Unfurnished</MenuItem>
              <MenuItem value={movininTypes.FurnishingStatus.SemiFurnished}>Semi-Furnished</MenuItem>
              <MenuItem value={movininTypes.FurnishingStatus.FullyFurnished}>Fully Furnished</MenuItem>
            </TextField>
            <TextField fullWidth select margin="normal" label="Status" value={status} onChange={(e) => setStatus(e.target.value as movininTypes.UnitStatus)}>
              <MenuItem value={movininTypes.UnitStatus.Vacant}>Vacant</MenuItem>
              <MenuItem value={movininTypes.UnitStatus.Occupied}>Occupied</MenuItem>
              <MenuItem value={movininTypes.UnitStatus.UnderMaintenance}>Under Maintenance</MenuItem>
            </TextField>
            <LoadingButton type="submit" variant="contained" loading={loading} sx={{ mt: 2 }}>Create</LoadingButton>
          </form>
        </div>
      )}
    </Layout>
  )
}

export default CreateUnit
