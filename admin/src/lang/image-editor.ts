import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        ADD_IMAGE: 'Ajouter une image principale',
        ADD_IMAGES: 'Ajouter des images supplémentaires',
        UPDATE_IMAGE: "Modifier l'image principale",
        DELETE_IMAGE: 'Êtes-vous sûr de vouloir supprimer cette image ?',
        MOVE_IMAGE_UP: 'Monter',
        MOVE_IMAGE_DOWN: 'Descendre',
    },
    en: {
        ADD_IMAGE: 'Add main image',
        ADD_IMAGES: 'Add additional images',
        UPDATE_IMAGE: 'Update main image',
        DELETE_IMAGE: 'Are you sure you want to delete this image?',
        MOVE_IMAGE_UP: 'Move up',
        MOVE_IMAGE_DOWN: 'Move down',
    }
})

langHelper.setLanguage(strings)
export { strings }
