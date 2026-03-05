const routes = {
  getPublicUnits: '/api/public-units/:page/:size',
  getPublicUnit: '/api/public-unit/:id',
  getUnit: '/api/unit/:id',
  getUnitsByProperty: '/api/units-by-property/:propertyId',
  create: '/api/create-unit',
  update: '/api/update-unit',
  delete: '/api/delete-unit/:id',
}

export default routes
