import express from 'express'
import routeNames from '../config/unitRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as unitController from '../controllers/unitController'

const routes = express.Router()

routes.route(routeNames.getPublicUnits).post(unitController.getPublicUnits)
routes.route(routeNames.getPublicUnit).get(unitController.getPublicUnit)
routes.route(routeNames.getUnit).get(authJwt.verifyToken, unitController.getUnit)
routes.route(routeNames.getUnitsByProperty).get(authJwt.verifyToken, unitController.getUnitsByProperty)
routes.route(routeNames.create).post(authJwt.verifyToken, unitController.createUnit)
routes.route(routeNames.update).put(authJwt.verifyToken, unitController.updateUnit)
routes.route(routeNames.delete).delete(authJwt.verifyToken, unitController.deleteUnit)

export default routes
