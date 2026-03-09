import express from 'express'
import routeNames from '../config/rentRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as rentController from '../controllers/rentController'

const routes = express.Router()

routes.route(routeNames.getRentEntries).get(authJwt.verifyToken, rentController.getRentEntries)
routes.route(routeNames.getMyRentEntries).get(authJwt.verifyToken, rentController.getMyRentEntries)
routes.route(routeNames.createRentEntries).post(authJwt.verifyToken, rentController.createRentEntries)
routes.route(routeNames.updateRentEntry).put(authJwt.verifyToken, rentController.updateRentEntry)

export default routes
