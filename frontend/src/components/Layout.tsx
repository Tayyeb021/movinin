import React, { useState, useEffect, ReactNode } from 'react'
import { Button } from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import * as movininTypes from 'movinin-types'
import { strings } from '@/lang/master'
import * as UserService from '@/services/UserService'
import * as helper from '@/utils/helper'
import { useAnalytics } from '@/utils/useAnalytics'
import { useUserContext, UserContextType } from '@/context/UserContext'
import Unauthorized from '@/components/Unauthorized'

interface LayoutProps {
  strict?: boolean
  children: ReactNode
  onLoad?: (user?: movininTypes.User) => void
}

const Layout = ({
  strict,
  children,
  onLoad
}: LayoutProps) => {
  useAnalytics()

  const { user, userLoaded, unauthorized } = useUserContext() as UserContextType
  const [loading, setLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const currentUser = UserService.getCurrentUser()

    if (!currentUser && strict) {
      UserService.signout(true, false)
    } else if (userLoaded) {
      setLoading(false)

      if (onLoad) {
        onLoad(user || undefined)
      }
    }
  }, [user, userLoaded, strict]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setResendLoading(true)
    try {
      if (user) {
        const data = { email: user.email }

        const status = await UserService.resendLink(data)
        if (status === 200) {
          helper.info(strings.VALIDATION_EMAIL_SENT)
        } else {
          helper.error(null, strings.VALIDATION_EMAIL_ERROR)
        }
      }
    } catch (err) {
      helper.error(err, strings.VALIDATION_EMAIL_ERROR)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <>
      {
        !(unauthorized && strict) && (
          (!user && !loading) || (user && user.verified) ? (
            <div className="content">{children}</div>
          ) : (
            !loading && (
              <div className="validate-email">
                <span>{strings.VALIDATE_EMAIL}</span>
                <LoadingButton type="button" variant="contained" className="btn-primary btn-resend" onClick={handleResend} loading={resendLoading}>
                  {strings.RESEND}
                </LoadingButton>
              </div>
            )
          )
        )
      }
      {unauthorized && strict && <Unauthorized />}
    </>
  )
}

export default Layout
