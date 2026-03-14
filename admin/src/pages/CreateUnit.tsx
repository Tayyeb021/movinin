import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TextField, MenuItem, Typography, Paper, Box } from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as UnitService from '@/services/UnitService'

// Must match backend FURNISHING_ITEM_KEYS (btms.config.ts)
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
  const [checklist, setChecklist] = useState<movininTypes.FurnishingItem[]>(
    FURNISHING_ITEMS.map(({ key }) => ({
      itemKey: key,
      quantity: 0,
      condition: movininTypes.FurnishingCondition.Good,
    }))
  )

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  const updateChecklistItem = (index: number, updates: Partial<movininTypes.FurnishingItem>) => {
    setChecklist((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId) return
    const payload: Parameters<typeof UnitService.createUnit>[0] = {
      property: propertyId,
      name,
      rent: Number(rent),
      securityDeposit: Number(securityDeposit),
      furnishingStatus,
      status,
    }
    if (needsChecklist(furnishingStatus)) {
      payload.checklist = checklist.filter((c) => c.quantity > 0)
      if (payload.checklist.length === 0) {
        return
      }
    }
    setLoading(true)
    try {
      await UnitService.createUnit(payload)
      navigate(`/btms-units/${propertyId}`)
    } catch (err) {
      setLoading(false)
    }
  }

  const showChecklist = useMemo(() => needsChecklist(furnishingStatus), [furnishingStatus])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ padding: 3, maxWidth: 640 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Add Unit</Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="Unit name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField fullWidth margin="normal" type="number" label="Rent" value={rent} onChange={(e) => setRent(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth margin="normal" type="number" label="Security deposit" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} required inputProps={{ min: 0 }} />
            <TextField fullWidth select margin="normal" label="Furnishing" value={furnishingStatus} onChange={(e) => setFurnishingStatus(e.target.value as movininTypes.FurnishingStatus)}>
              <MenuItem value={movininTypes.FurnishingStatus.Unfurnished}>Unfurnished</MenuItem>
              <MenuItem value={movininTypes.FurnishingStatus.SemiFurnished}>Semi-Furnished</MenuItem>
              <MenuItem value={movininTypes.FurnishingStatus.FullyFurnished}>Fully Furnished</MenuItem>
            </TextField>
            {showChecklist && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Furnishing checklist (required for Semi/Fully Furnished)</Typography>
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
              <MenuItem value={movininTypes.UnitStatus.Vacant}>Vacant</MenuItem>
              <MenuItem value={movininTypes.UnitStatus.Occupied}>Occupied</MenuItem>
              <MenuItem value={movininTypes.UnitStatus.UnderMaintenance}>Under Maintenance</MenuItem>
            </TextField>
            <LoadingButton type="submit" variant="contained" loading={loading} sx={{ mt: 2 }}>Create</LoadingButton>
          </form>
        </Box>
      )}
    </Layout>
  )
}

export default CreateUnit
