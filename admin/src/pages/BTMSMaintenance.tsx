import React, { useState, useEffect } from 'react'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material'
import * as movininTypes from 'movinin-types'
import { strings as commonStrings } from '@/lang/common'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import LoadingButton from '@/components/LoadingButton'
import * as MaintenanceService from '@/services/MaintenanceService'
import * as PropertyService from '@/services/PropertyService'
import * as UnitService from '@/services/UnitService'

const BTMSMaintenance = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [tickets, setTickets] = useState<movininTypes.MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<movininTypes.MaintenanceTicket | null>(null)
  const [properties, setProperties] = useState<movininTypes.Property[]>([])
  const [units, setUnits] = useState<movininTypes.Unit[]>([])
  const [createPropertyId, setCreatePropertyId] = useState('')
  const [createUnitId, setCreateUnitId] = useState('')
  const [createCategory, setCreateCategory] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPriority, setCreatePriority] = useState<movininTypes.MaintenancePriority>(movininTypes.MaintenancePriority.Medium)
  const [updateStatus, setUpdateStatus] = useState<movininTypes.MaintenanceStatus>(movininTypes.MaintenanceStatus.Open)
  const [updateCost, setUpdateCost] = useState('')
  const [createSaving, setCreateSaving] = useState(false)
  const [updateSaving, setUpdateSaving] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user) return
    MaintenanceService.getTickets().then(setTickets).catch(() => setTickets([])).finally(() => setLoading(false))
  }, [user])

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
    if (!createPropertyId) {
      setUnits([])
      setCreateUnitId('')
      return
    }
    UnitService.getUnitsByProperty(createPropertyId).then(setUnits).catch(() => setUnits([]))
    setCreateUnitId('')
  }, [createPropertyId])

  const openEdit = (t: movininTypes.MaintenanceTicket) => {
    setEditingTicket(t)
    setUpdateStatus(t.status)
    setUpdateCost(t.cost != null ? String(t.cost) : '')
    setUpdateOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createPropertyId || !createUnitId || !createCategory.trim() || !createDescription.trim()) return
    setCreateSaving(true)
    try {
      await MaintenanceService.createTicket({
        property: createPropertyId,
        unit: createUnitId,
        category: createCategory.trim(),
        description: createDescription.trim(),
        priority: createPriority,
      })
      setCreateOpen(false)
      setCreatePropertyId('')
      setCreateUnitId('')
      setCreateCategory('')
      setCreateDescription('')
      setCreatePriority(movininTypes.MaintenancePriority.Medium)
      MaintenanceService.getTickets().then(setTickets)
    } catch (_) {}
    finally {
      setCreateSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTicket?._id) return
    setUpdateSaving(true)
    try {
      await MaintenanceService.updateTicket({
        _id: editingTicket._id,
        status: updateStatus,
        cost: updateCost ? Number(updateCost) : undefined,
        closedAt: updateStatus === movininTypes.MaintenanceStatus.Completed ? new Date().toISOString() : undefined,
      })
      setUpdateOpen(false)
      setEditingTicket(null)
      MaintenanceService.getTickets().then(setTickets)
    } catch (_) {}
    finally {
      setUpdateSaving(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Maintenance tickets</Typography>
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => setCreateOpen(true)}>Create ticket</Button>
          {loading && <Backdrop text={commonStrings.LOADING} />}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property / Unit</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No tickets</TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>
                          {(t.property as movininTypes.Property)?.name ?? '-'} / {(t.unit as movininTypes.Unit)?.name ?? '-'}
                        </TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell>{typeof t.description === 'string' ? t.description.slice(0, 50) : '-'}</TableCell>
                        <TableCell>{t.priority}</TableCell>
                        <TableCell>{t.status}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => openEdit(t)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create maintenance ticket</DialogTitle>
            <form onSubmit={handleCreate}>
              <DialogContent>
                <TextField fullWidth select margin="normal" label="Property" value={createPropertyId} onChange={(e) => setCreatePropertyId(e.target.value)} required>
                  <MenuItem value="">Select property</MenuItem>
                  {properties.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </TextField>
                <TextField fullWidth select margin="normal" label="Unit" value={createUnitId} onChange={(e) => setCreateUnitId(e.target.value)} required disabled={!createPropertyId}>
                  <MenuItem value="">Select unit</MenuItem>
                  {units.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                </TextField>
                <TextField fullWidth margin="normal" label="Category" value={createCategory} onChange={(e) => setCreateCategory(e.target.value)} required />
                <TextField fullWidth margin="normal" multiline rows={2} label="Description" value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} required />
                <TextField fullWidth select margin="normal" label="Priority" value={createPriority} onChange={(e) => setCreatePriority(e.target.value as movininTypes.MaintenancePriority)}>
                  <MenuItem value={movininTypes.MaintenancePriority.Low}>Low</MenuItem>
                  <MenuItem value={movininTypes.MaintenancePriority.Medium}>Medium</MenuItem>
                  <MenuItem value={movininTypes.MaintenancePriority.High}>High</MenuItem>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                <LoadingButton type="submit" variant="contained" loading={createSaving}>Create</LoadingButton>
              </DialogActions>
            </form>
          </Dialog>

          <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Update ticket</DialogTitle>
            <DialogContent>
              <TextField fullWidth select margin="normal" label="Status" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value as movininTypes.MaintenanceStatus)}>
                <MenuItem value={movininTypes.MaintenanceStatus.Open}>Open</MenuItem>
                <MenuItem value={movininTypes.MaintenanceStatus.InProgress}>In Progress</MenuItem>
                <MenuItem value={movininTypes.MaintenanceStatus.Completed}>Completed</MenuItem>
              </TextField>
              <TextField fullWidth margin="normal" type="number" label="Cost" value={updateCost} onChange={(e) => setUpdateCost(e.target.value)} inputProps={{ min: 0 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <LoadingButton variant="contained" onClick={handleUpdate} loading={updateSaving}>Save</LoadingButton>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Layout>
  )
}

export default BTMSMaintenance
