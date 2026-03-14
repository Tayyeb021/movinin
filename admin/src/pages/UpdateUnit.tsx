import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextField, MenuItem, Typography, Paper, Box } from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
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

const FURNISHING_ITEMS: { key: string; label: string }[] = [
  { key: 'Bed', label: 'Bed(s)' },
  { key: 'Mattress', label: 'Mattress' },
  { key: 'Wardrobe', label: 'Wardrobe' },
  { key: 'Sofa', label: 'Sofa' },
  { key: 'DiningTable', label: 'Dining Table' },
  { key: 'Chairs', label: 'Chairs' },
  { key: 'Refrigerator', label: 'Refrigerator' },
  { key: 'WashingMachine', label: 'Washing Machine' },
  { key: 'Microwave', label: 'Microwave' },
  { key: 'AirConditioner', label: 'Air Conditioner(s)' },
  { key: 'Curtains', label: 'Curtains' },
  { key: 'WaterHeater', label: 'Water Heater' },
  { key: 'TV', label: 'TV' },
  { key: 'KitchenCabinets', label: 'Kitchen Cabinets' },
  { key: 'LightFixtures', label: 'Light Fixtures' },
]

const needsChecklist = (s: movininTypes.FurnishingStatus) =>
  s === movininTypes.FurnishingStatus.SemiFurnished || s === movininTypes.FurnishingStatus.FullyFurnished

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
  const [checklist, setChecklist] = useState<movininTypes.FurnishingItem[]>([])

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
      if (u.checklist && u.checklist.length > 0) {
        const byKey: Record<string, movininTypes.FurnishingItem> = {}
        u.checklist.forEach((c) => { byKey[c.itemKey] = c })
        setChecklist(FURNISHING_ITEMS.map(({ key }) => byKey[key] ?? { itemKey: key, quantity: 0, condition: movininTypes.FurnishingCondition.Good }))
      } else {
        setChecklist(FURNISHING_ITEMS.map(({ key }) => ({ itemKey: key, quantity: 0, condition: movininTypes.FurnishingCondition.Good })))
      }
    }).catch(() => {})
  }, [id, user])

  const updateChecklistItem = (index: number, updates: Partial<movininTypes.FurnishingItem>) => {
    setChecklist((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    const payload: Parameters<typeof UnitService.updateUnit>[0] = {
      _id: id,
      name,
      rent: Number(rent),
      securityDeposit: Number(securityDeposit),
      size: size ? Number(size) : undefined,
      furnishingStatus,
      status,
    }
    if (needsChecklist(furnishingStatus)) {
      payload.checklist = checklist.filter((c) => c.quantity > 0)
      if (payload.checklist.length === 0) return
    } else {
      payload.checklist = []
    }
    setLoading(true)
    try {
      await UnitService.updateUnit(payload)
      const u = await UnitService.getUnit(id)
      const propId = typeof u.property === 'object' ? (u.property as movininTypes.Property)._id : u.property
      navigate(`/btms-units/${propId}`)
    } catch (err) {
      setLoading(false)
    }
  }

  const showChecklist = useMemo(() => needsChecklist(furnishingStatus), [furnishingStatus])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ padding: 3, maxWidth: 640 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Edit Unit</Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="Unit name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField fullWidth margin="normal" type="number" label="Rent" value={rent} onChange={(e) => setRent(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth margin="normal" type="number" label="Security deposit" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth margin="normal" type="number" label="Size (optional)" value={size} onChange={(e) => setSize(e.target.value)} inputProps={{ min: 0 }} />
            <TextField fullWidth select margin="normal" label="Furnishing" value={furnishingStatus} onChange={(e) => setFurnishingStatus(e.target.value as movininTypes.FurnishingStatus)}>
              {FURNISHING_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            {showChecklist && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Furnishing checklist</Typography>
                {FURNISHING_ITEMS.map((item, i) => (
                  <Box key={item.key} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                    <Typography sx={{ minWidth: 140 }}>{item.label}</Typography>
                    <TextField type="number" size="small" label="Qty" value={checklist[i]?.quantity ?? 0} onChange={(e) => updateChecklistItem(i, { quantity: Math.max(0, Number(e.target.value)) })} inputProps={{ min: 0 }} sx={{ width: 72 }} />
                    <TextField select size="small" label="Condition" value={checklist[i]?.condition ?? movininTypes.FurnishingCondition.Good} onChange={(e) => updateChecklistItem(i, { condition: e.target.value as movininTypes.FurnishingCondition })} sx={{ minWidth: 140 }}>
                      <MenuItem value={movininTypes.FurnishingCondition.New}>New</MenuItem>
                      <MenuItem value={movininTypes.FurnishingCondition.Good}>Good</MenuItem>
                      <MenuItem value={movininTypes.FurnishingCondition.NeedsRepair}>Needs Repair</MenuItem>
                    </TextField>
                    <TextField size="small" label="Notes" value={checklist[i]?.notes ?? ''} onChange={(e) => updateChecklistItem(i, { notes: e.target.value })} sx={{ flex: 1, minWidth: 120 }} />
                  </Box>
                ))}
              </Paper>
            )}
            <TextField fullWidth select margin="normal" label="Status" value={status} onChange={(e) => setStatus(e.target.value as movininTypes.UnitStatus)}>
              {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <LoadingButton type="submit" variant="contained" loading={loading} sx={{ mt: 2 }}>Save</LoadingButton>
          </form>
        </Box>
      )}
    </Layout>
  )
}

export default UpdateUnit
