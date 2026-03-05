import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Typography, Button, Grid, CircularProgress } from '@mui/material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/btms-dashboard'
import * as DashboardService from '@/services/DashboardService'

const ManagerDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [data, setData] = useState<movininTypes.ManagerDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onLoad = async (_user?: movininTypes.User) => {
    if (_user) setUser(_user)
  }

  useEffect(() => {
    if (!user) return
    DashboardService.getManagerDashboard()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div style={{ padding: 24 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {strings.BTMS_DASHBOARD}
          </Typography>
          {loading && <CircularProgress />}
          {error && <Typography color="error">{error}</Typography>}
          {data && !loading && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.TOTAL_PROPERTIES}</Typography>
                      <Typography variant="h4">{data.totalProperties}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.TOTAL_UNITS}</Typography>
                      <Typography variant="h4">{data.totalUnits}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.OCCUPIED}</Typography>
                      <Typography variant="h4">{data.occupiedUnits}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.VACANT}</Typography>
                      <Typography variant="h4">{data.vacantUnits}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.RENT_DUE}</Typography>
                      <Typography variant="h4">{data.monthlyRentDue}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.RENT_COLLECTED}</Typography>
                      <Typography variant="h4">{data.rentCollected}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.OVERDUE}</Typography>
                      <Typography variant="h4">{data.overdueCount}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{strings.OPEN_MAINTENANCE}</Typography>
                      <Typography variant="h4">{data.openMaintenanceCount}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item>
                  <Button variant="contained" onClick={() => navigate('/properties')}>
                    {strings.VIEW_PROPERTIES}
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={() => navigate('/btms-tenants')}>
                    {strings.VIEW_TENANTS}
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={() => navigate('/btms-maintenance')}>
                    {strings.VIEW_MAINTENANCE}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </div>
      )}
    </Layout>
  )
}

export default ManagerDashboard
