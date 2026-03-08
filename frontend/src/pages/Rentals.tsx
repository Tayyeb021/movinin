import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import * as UnitService from '@/services/UnitService'
import { strings as commonStrings } from '@/lang/common'

type PublicUnit = { _id?: string; name?: string; rent?: number }

const Rentals = () => {
  const navigate = useNavigate()
  const [units, setUnits] = useState<PublicUnit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    UnitService.getPublicUnits(1, 12).then((data: { resultData?: PublicUnit[] }) => {
      setUnits(data?.resultData ?? [])
    }).catch(() => setUnits([])).finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h2>Available rentals</h2>
        {loading && <Backdrop text={commonStrings.LOADING} />}
        <ul>
          {units.map((u) => (
            <li key={u._id}>
              {u.name} - {u.rent}
              <button type="button" onClick={() => navigate(`/rental/${u._id}`)}>View</button>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

export default Rentals
