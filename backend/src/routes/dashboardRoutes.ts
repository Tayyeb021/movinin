import express from 'express'
import routeNames from '../config/dashboardRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as dashboardController from '../controllers/dashboardController'

const routes = express.Router()

routes.route(routeNames.getManagerDashboard).get(authJwt.verifyToken, dashboardController.getManagerDashboard)
routes.route(routeNames.getTenantDashboard).get(authJwt.verifyToken, authJwt.requireTenant, dashboardController.getTenantDashboard)

export default routes
