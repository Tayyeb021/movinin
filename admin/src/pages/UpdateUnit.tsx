import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextField, Button, MenuItem } from '@mui/material'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as UnitService from '@/services/UnitService'

const FURNISHING_OPTIONS = [
  { value: movininTypes.FurnishingStatus.Unfurnished, label: 'Unfurnished' },
  { value: movininTypes.FurnishingStatus.SemiFurnished, label: 'Semi-Furnished' },
  { value: movininTypes.FurnishingStatus.FullyFurnished, label: 'Fully Furnished' },
]
const STATUS_OPTIONS = [
  { value: movininTypes.UnitStatus.Vacant, label: 'Vacant' },
  { value: movininTypes.UnitStatus.Occupied, label: 'Occupied' },
  { value: movininTypes.UnitStatus.UnderMaintenance, label: 'Under Maintenance' },
]

const UpdateUnit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [name, setName] = useState('')
  const [rent, setRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [size, setSize] = useState('')
  const [furnishingStatus, setFurnishingStatus] = useState(movininTypes.FurnishingStatus.Unfurnished)
  const [status, setStatus] = useState(movininTypes.UnitStatus.Vacant)
  const [loading, setLoading] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!id || !user) return
    UnitService.getUnit(id).then((u) => {
      setName(u.name)
      setRent(String(u.rent))
      setSecurityDeposit(String(u.securityDeposit))
      setSize(u.size ? String(u.size) : '')
      setFurnishingStatus(u.furnishingStatus)
      setStatus(u.status)
    }).catch(() => {})
  }, [id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      await UnitService.updateUnit({
        _id: id,
        name,
        rent: Number(rent),
        securityDeposit: Number(securityDeposit),
        size: size ? Number(size) : undefined,
        furnishingStatus,
        status,
      })
      const u = await UnitService.getUnit(id)
      const propId = typeof u.property === 'object' ? (u.property as movininTypes.Property)._id : u.property
      navigate(`/btms-units/${propId}`)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div style={{ padding: 24, maxWidth: 480 }}>
          <h2>Edit Unit</h2>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="Unit name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField fullWidth margin="normal" type="number" label="Rent" value={rent} onChange={(e) => setRent(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth margin="normal" type="number" label="Security deposit" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth margin="normal" type="number" label="Size (optional)" value={size} onChange={(e) => setSize(e.target.value)} inputProps={{ min: 0 }} />
            <TextField fullWidth select margin="normal" label="Furnishing" value={furnishingStatus} onChange={(e) => setFurnishingStatus(e.target.value as movininTypes.FurnishingStatus)}>
              {FURNISHING_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField fullWidth select margin="normal" label="Status" value={status} onChange={(e) => setStatus(e.target.value as movininTypes.UnitStatus)}>
              {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>Save</Button>
          </form>
        </div>
      )}
    </Layout>
  )
}

export default UpdateUnit
