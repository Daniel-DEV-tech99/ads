/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'station') return '/apps/transactions/list'
  if (role === 'admin') return '/apps/filters/list'
    else return '/dashboards/analytics'
}

export default getHomeRoute
