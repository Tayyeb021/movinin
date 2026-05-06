import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    ACTIVATE_HEADING: 'Activation du compte',
    TOKEN_EXPIRED: "Votre lien d'activation du compte a expiré.",
    ACTIVATE: 'Activer',
    LINK_INVALID_TITLE: 'Lien invalide ou expiré',
    LINK_INVALID_BODY: 'Ce lien d’activation est incomplet, invalide ou expiré. Demandez un nouveau lien depuis la page de connexion ou contactez le support.',
  },
  en: {
    ACTIVATE_HEADING: 'Account Activation',
    TOKEN_EXPIRED: 'Your account activation link expired.',
    ACTIVATE: 'Activate',
    LINK_INVALID_TITLE: 'Invalid or expired link',
    LINK_INVALID_BODY: 'This activation link is missing parameters, invalid, or expired. Request a new link from the sign-in page or contact support.',
  },
})

langHelper.setLanguage(strings)
export { strings }
