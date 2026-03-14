import React, { useState, useEffect } from 'react'
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import * as movininTypes from 'movinin-types'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import { strings as commonStrings } from '@/lang/common'
import * as PropertyService from '@/services/PropertyService'
import * as UnitService from '@/services/UnitService'
import * as RentService from '@/services/RentService'

const BTSMRent = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [properties, setProperties] = useState<movininTypes.Property[]>([])
  const [units, setUnits] = useState<movininTypes.Unit[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [entries, setEntries] = useState<movininTypes.RentEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<movininTypes.RentEntry | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<movininTypes.RentStatus>(movininTypes.RentStatus.Paid)
  const [paidAmount, setPaidAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const onLoad = (_user?: movininTypes.User) => setUser(_user)

  useEffect(() => {
    if (!user?._id) return
    setLoading(true)
    PropertyService.getProperties('', { agencies: [user._id] }, 1, 200)
      .then((res: movininTypes.Result<movininTypes.Property>) => {
        const data = Array.isArray(res) && res.length > 0 ? res[0] : null
        setProperties(data?.resultData ?? [])
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!user || !selectedPropertyId) {
      setUnits([])
      setSelectedUnitId('')
      setEntries([])
      return
    }
    UnitService.getUnitsByProperty(selectedPropertyId)
      .then(setUnits)
      .catch(() => setUnits([]))
    setSelectedUnitId('')
    setEntries([])
  }, [user, selectedPropertyId])

  useEffect(() => {
    if (!user || !selectedUnitId) {
      setEntries([])
      return
    }
    setLoadingEntries(true)
    RentService.getRentEntries({ unitId: selectedUnitId })
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoadingEntries(false))
  }, [user, selectedUnitId])

  const openPaymentDialog = (entry: movininTypes.RentEntry) => {
    setSelectedEntry(entry)
    setPaymentStatus(entry.status === movininTypes.RentStatus.Paid ? movininTypes.RentStatus.Paid : movininTypes.RentStatus.Paid)
    setPaidAmount(String(entry.amount ?? ''))
    setPaymentDialogOpen(true)
  }

  const handleSavePayment = async () => {
    if (!selectedEntry?._id) return
    setSaving(true)
    try {
      await RentService.updateRentEntry({
        _id: selectedEntry._id,
        status: paymentStatus,
        paidAmount: paidAmount ? Number(paidAmount) : undefined,
        paidAt: new Date().toISOString(),
      })
      setPaymentDialogOpen(false)
      setSelectedEntry(null)
      if (selectedUnitId) {
        RentService.getRentEntries({ unitId: selectedUnitId }).then(setEntries)
      }
    } catch (_) {
      // keep dialog open
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Rent tracking
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              select
              size="small"
              label="Property"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Select property</MenuItem>
              {properties.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Unit"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              sx={{ minWidth: 200 }}
              disabled={!selectedPropertyId}
            >
              <MenuItem value="">Select unit</MenuItem>
              {units.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {loadingEntries && <Backdrop text={commonStrings.LOADING} />}
          {selectedUnitId && !loadingEntries && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No rent entries
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((e) => (
                      <TableRow key={e._id}>
                        <TableCell>{e.period}</TableCell>
                        <TableCell>{e.dueDate ? new Date(e.dueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{e.amount}</TableCell>
                        <TableCell>{e.status}</TableCell>
                        <TableCell align="right">
                          {e.status !== movininTypes.RentStatus.Paid && (
                            <Button size="small" variant="outlined" onClick={() => openPaymentDialog(e)}>
                              Mark paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Record payment</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                select
                margin="normal"
                label="Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as movininTypes.RentStatus)}
              >
                <MenuItem value={movininTypes.RentStatus.Paid}>Paid</MenuItem>
                <MenuItem value={movininTypes.RentStatus.Partial}>Partial</MenuItem>
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label="Paid amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSavePayment} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Layout>
  )
}

export default BTSMRent
