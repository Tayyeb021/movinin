import express from 'express'
import routeNames from '../config/tenantRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as tenantController from '../controllers/tenantController'

const routes = express.Router()

routes.route(routeNames.getMyTenancy).get(authJwt.verifyToken, tenantController.getMyTenancy)
routes.route(routeNames.getTenants).get(authJwt.verifyToken, tenantController.getTenants)
routes.route(routeNames.getTenantsByProperty).get(authJwt.verifyToken, tenantController.getTenantsByProperty)
routes.route(routeNames.getTenantsByUnit).get(authJwt.verifyToken, tenantController.getTenantsByUnit)
routes.route(routeNames.create).post(authJwt.verifyToken, tenantController.createTenant)
routes.route(routeNames.update).put(authJwt.verifyToken, tenantController.updateTenant)
routes.route(routeNames.endTenancy).put(authJwt.verifyToken, tenantController.endTenancy)

export default routes
