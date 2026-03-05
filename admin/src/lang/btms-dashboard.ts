import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    BTMS_DASHBOARD: 'Tableau de bord BTMS',
    TOTAL_PROPERTIES: 'Total propriétés',
    TOTAL_UNITS: 'Total unités',
    OCCUPIED: 'Occupées',
    VACANT: 'Vacantes',
    RENT_DUE: 'Loyer dû',
    RENT_COLLECTED: 'Loyer perçu',
    OVERDUE: 'En retard',
    OPEN_MAINTENANCE: 'Maintenance ouverte',
    VIEW_PROPERTIES: 'Voir les propriétés',
    VIEW_TENANTS: 'Voir les locataires',
    VIEW_MAINTENANCE: 'Voir la maintenance',
  },
  en: {
    BTMS_DASHBOARD: 'BTMS Dashboard',
    TOTAL_PROPERTIES: 'Total Properties',
    TOTAL_UNITS: 'Total Units',
    OCCUPIED: 'Occupied',
    VACANT: 'Vacant',
    RENT_DUE: 'Rent Due',
    RENT_COLLECTED: 'Rent Collected',
    OVERDUE: 'Overdue',
    OPEN_MAINTENANCE: 'Open Maintenance',
    VIEW_PROPERTIES: 'View Properties',
    VIEW_TENANTS: 'View Tenants',
    VIEW_MAINTENANCE: 'View Maintenance',
  },
})

langHelper.setLanguage(strings)
export { strings }
