import express from 'express'
import routeNames from '../config/maintenanceRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as maintenanceController from '../controllers/maintenanceController'

const routes = express.Router()

routes.route(routeNames.getTickets).get(authJwt.verifyToken, maintenanceController.getTickets)
routes.route(routeNames.getMyTickets).get(authJwt.verifyToken, maintenanceController.getMyTickets)
routes.route(routeNames.getTicket).get(authJwt.verifyToken, maintenanceController.getTicket)
routes.route(routeNames.create).post(authJwt.verifyToken, maintenanceController.createTicket)
routes.route(routeNames.update).put(authJwt.verifyToken, maintenanceController.updateTicket)

export default routes
