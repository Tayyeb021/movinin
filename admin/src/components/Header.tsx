import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Button,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  More as MoreIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  CorporateFare as AgenciesIcon,
  LocationOn as LocationsIcon,
  Home as PropertiesIcon,
  People as UsersIcon,
  InfoTwoTone as AboutIcon,
  DescriptionTwoTone as TosIcon,
  ExitToApp as SignoutIcon,
  Flag as CountriesIcon,
  CalendarMonth as SchedulerIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from 'movinin-types'
import env from '@/config/env.config'
import { strings } from '@/lang/header'
import { strings as commonStrings } from '@/lang/common'
import * as UserService from '@/services/UserService'
import Avatar from './Avatar'
import * as langHelper from '@/utils/langHelper'
import * as helper from '@/utils/helper'
import { useNotificationContext, NotificationContextType } from '@/context/NotificationContext'
import { useUserContext, UserContextType } from '@/context/UserContext'

import '@/assets/css/header.css'

interface HeaderProps {
  hidden?: boolean
}

const Header = ({
  hidden,
}: HeaderProps) => {
  const navigate = useNavigate()

  const { user } = useUserContext() as UserContextType
  const { notificationCount } = useNotificationContext() as NotificationContextType

  const [lang, setLang] = useState(helper.getLanguage(env.DEFAULT_LANGUAGE))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sideAnchorEl, setSideAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const isLangMenuOpen = Boolean(langAnchorEl)
  const isSideMenuOpen = Boolean(sideAnchorEl)

  const classes = {
    list: {
      width: 280,
    },
    drawerPaper: {
      width: 280,
      boxSizing: 'border-box',
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 16px 12px',
      minHeight: 56,
    },
    navItem: {
      py: 1.25,
      px: 2,
    },
    formControl: {
      margin: 1,
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: 2,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: 2,
    },
  }

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const refreshPage = () => {
    // const params = new URLSearchParams(window.location.search)

    // if (params.has('l')) {
    //   params.delete('l')
    //   // window.location.href = window.location.href.split('?')[0] + ([...params].length > 0 ? `?${params}` : '')
    //   window.location.replace(window.location.href.split('?')[0] + ([...params].length > 0 ? `?${params}` : ''))
    // } else {
    //   // window.location.reload()
    //   window.location.replace(window.location.href)
    // }
    navigate(0)
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      setLang(helper.getLanguage(code))
      const currentLang = UserService.getLanguage()
      if (isSignedIn && user) {
        // Update user language
        const data: movininTypes.UpdateLanguagePayload = {
          id: user._id as string,
          language: code,
        }
        const status = await UserService.updateLanguage(data)
        if (status === 200) {
          UserService.setLanguage(code)
          if (code && code !== currentLang) {
            // Refresh page
            refreshPage()
          }
        } else {
          toast(commonStrings.CHANGE_LANGUAGE_ERROR, { type: 'error' })
        }
      } else {
        UserService.setLanguage(code)
        if (code && code !== currentLang) {
          // Refresh page
          refreshPage()
        }
      }
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleSettingsClick = () => {
    handleMenuClose()
    navigate('/settings')
  }

  const handleSignout = async () => {
    handleMenuClose()
    await UserService.signout()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleSideMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSideAnchorEl(event.currentTarget)
  }

  const handleSideMenuClose = () => {
    setSideAnchorEl(null)
  }

  const handleNotificationsClick = () => {
    navigate('/notifications')
  }

  useEffect(() => {
    const language = langHelper.getLanguage()
    setLang(helper.getLanguage(language))
    langHelper.setLanguage(strings, language)
  }, [])

  useEffect(() => {
    if (user) {
      setIsSignedIn(true)
    } else {
      setIsSignedIn(false)
    }
    setIsLoaded(true)
  }, [user])

  const menuId = 'primary-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      className="menu"
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        <Typography>{strings.SETTINGS}</Typography>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <SignoutIcon className="header-action" />
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const mobileMenuId = 'mobile-menu'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      className="menu"
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        <p>{strings.SETTINGS}</p>
      </MenuItem>
      <MenuItem onClick={handleLangMenuOpen}>
        <LanguageIcon className="header-action" />
        <p>{strings.LANGUAGE}</p>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <SignoutIcon className="header-action" />
        <p>{strings.SIGN_OUT}</p>
      </MenuItem>
    </Menu>
  )

  const languageMenuId = 'language-menu'
  const renderLanguageMenu = (
    <Menu
      anchorEl={langAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isLangMenuOpen}
      onClose={handleLangMenuClose}
      className="menu"
    >
      {
        env._LANGUAGES.map((language) => (
          <MenuItem onClick={handleLangMenuClose} data-code={language.code} key={language.code}>
            {language.label}
          </MenuItem>
        ))
      }
    </Menu>
  )

  return (
    <div style={hidden ? { display: 'none' } : classes.grow} className="header">
      <AppBar position="fixed" sx={{ bgcolor: '#121212' }}>
        <Toolbar className="toolbar">
          {isLoaded && isSignedIn && (
            <IconButton edge="start" sx={classes.menuButton} color="inherit" aria-label="open drawer" onClick={handleSideMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}
          <>
            <Drawer
              open={isSideMenuOpen}
              onClose={handleSideMenuClose}
              className="menu side-menu"
              variant="temporary"
              anchor="left"
              PaperProps={{ sx: classes.drawerPaper }}
            >
              <Box sx={classes.drawerHeader}>
                <Typography variant="h6" component="span" fontWeight={600}>
                  {env.WEBSITE_NAME}
                </Typography>
                <IconButton aria-label="close menu" onClick={handleSideMenuClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider />
              <List sx={classes.list} disablePadding>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.DASHBOARD} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/scheduler'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><SchedulerIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.SCHEDULER} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/agencies'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><AgenciesIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.AGENCIES} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/countries'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><CountriesIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.COUNTRIES} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/locations'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><LocationsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.LOCATIONS} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/properties'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><PropertiesIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.PROPERTIES} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/btms-dashboard'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.BTMS_DASHBOARD} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/btms-tenants'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><UsersIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Tenants" primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/btms-create-tenant'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><UsersIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Assign tenant" primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/btms-rent'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Rent tracking" primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/btms-maintenance'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Maintenance" primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/users'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><UsersIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.USERS} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('about/'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><AboutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.ABOUT} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/tos'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><TosIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.TOS} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
                <ListItemButton sx={classes.navItem} onClick={() => { navigate('/contact'); handleSideMenuClose() }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><MailIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={strings.CONTACT} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
              </List>
            </Drawer>
          </>
          <div style={classes.grow} />
          <div className="header-desktop">
            {isSignedIn && (
              <IconButton aria-label="" color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            {isLoaded && (
              <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                {lang?.label}
              </Button>
            )}
            {isSignedIn && user && (
              <IconButton edge="end" aria-label="account" aria-controls={menuId} aria-haspopup="true" onClick={handleAccountMenuOpen} color="inherit">
                <Avatar record={user} type={user.type} size="small" readonly />
              </IconButton>
            )}
          </div>
          <div className="header-mobile">
            {!isSignedIn && (
              <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                {lang?.label}
              </Button>
            )}
            {isSignedIn && (
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            {isSignedIn && (
              <IconButton aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}
      {renderLanguageMenu}
    </div>
  )
}

export default Header
