import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SIGN_UP_HEADING: 'Inscription',
    SIGN_UP: "S'inscrire",
    SIGN_UP_ERROR: "Une erreur s'est produite lors de l'inscription.",
    SIGN_UP_SUCCESS: 'Compte créé. Vérifiez votre e-mail pour le lien d’activation. Si l’e-mail n’arrive pas, vérifiez le dossier spam ou contactez le support.',
  },
  en: {
    SIGN_UP_HEADING: 'Register',
    SIGN_UP: 'Register',
    SIGN_UP_ERROR: 'An error occurred during sign up.',
    SIGN_UP_SUCCESS: 'Account created. Check your email for the activation link. If no email arrives, check spam or SMTP settings.',
  },
})

langHelper.setLanguage(strings)
export { strings }
