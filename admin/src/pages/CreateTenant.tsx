import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, MenuItem, Button, Box, Typography, Paper } from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import * as PropertyService from '@/services/PropertyService'
import * as UnitService from '@/services/UnitService'
import * as TenantService from '@/services/TenantService'
import * as UserService from '@/services/UserService'

const CreateTenant = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [properties, setProperties] = useState<movininTypes.Property[]>([])
  const [units, setUnits] = useState<movininTypes.Unit[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [userId, setUserId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userOptions, setUserOptions] = useState<movininTypes.User[]>([])
  const [moveInDate, setMoveInDate] = useState('')
  const [contractStart, setContractStart] = useState('')
  const [contractEnd, setContractEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user?._id) return
    PropertyService.getProperties('', { agencies: [user._id] }, 1, 200)
      .then((res: movininTypes.Result<movininTypes.Property>) => {
        const data = Array.isArray(res) && res.length > 0 ? res[0] : null
        setProperties(data?.resultData ?? [])
      })
      .catch(() => setProperties([]))
  }, [user])

  useEffect(() => {
    if (!propertyId) {
      setUnits([])
      setUnitId('')
      return
    }
    UnitService.getUnitsByProperty(propertyId).then(setUnits).catch(() => setUnits([]))
    setUnitId('')
  }, [propertyId])

  useEffect(() => {
    if (!userSearch.trim()) {
      setUserOptions([])
      return
    }
    const t = setTimeout(() => {
      setSearching(true)
      UserService.getRenters(userSearch, 1, 20)
        .then((data: movininTypes.Result<movininTypes.User>) => {
          const res = Array.isArray(data) && data.length > 0 ? data[0] : null
          setUserOptions(res?.resultData ?? [])
        })
        .catch(() => setUserOptions([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unitId || !userId || !moveInDate || !contractStart || !contractEnd) return
    setLoading(true)
    try {
      await TenantService.createTenant({
        user: userId,
        unit: unitId,
        moveInDate,
        contractStart,
        contractEnd,
      })
      navigate('/btms-tenants')
    } catch (_) {
      setLoading(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ p: 3, maxWidth: 560 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Assign tenant to unit
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                select
                margin="normal"
                label="Property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                required
              >
                <MenuItem value="">Select property</MenuItem>
                {properties.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                margin="normal"
                label="Unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                required
                disabled={!propertyId}
              >
                <MenuItem value="">Select unit</MenuItem>
                {units.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} {u.status && `(${u.status})`}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Search user (email or name)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Type to search users"
              />
              <TextField
                fullWidth
                select
                margin="normal"
                label="User (tenant)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={!userSearch && userOptions.length === 0}
              >
                <MenuItem value="">Select user</MenuItem>
                {userOptions.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.fullName} ({u.email})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Move-in date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Contract start"
                value={contractStart}
                onChange={(e) => setContractStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Contract end"
                value={contractEnd}
                onChange={(e) => setContractEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <LoadingButton type="submit" variant="contained" loading={loading} disabled={!unitId || !userId || !moveInDate || !contractStart || !contractEnd}>
                  Create tenant
                </LoadingButton>
                <Button variant="outlined" onClick={() => navigate('/btms-tenants')}>
                  Cancel
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      )}
    </Layout>
  )
}

export default CreateTenant
