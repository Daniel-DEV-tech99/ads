const navigation = () => {
  return [
    {
      title: 'Admin',
      icon: 'tabler:users',
      path:'/apps/admin/list'
    },
 
    {
       title: 'Users',
      icon: 'tabler:user-circle',
      children: [
        {
          title: 'Vendor',
          path: '/apps/users/vendor'
        },
        {
          title: 'Customer',
          path: '/apps/users/customer'
        }
      ]
    },
     {
      title: 'Stations',
      icon: 'tabler:gas-station',
      path:'/apps/stations/list'
    },
   {
      title: 'Filters',
      icon: 'tabler:filter',
      path:'/apps/filters/list'
  },
  {
      title: 'Category',
      icon: 'tabler:category',
      path:'/apps/categories/list'
    },
  {
      title: 'Transactions',
      icon: 'tabler:transaction-dollar',
      path:'/apps/transactions/list'
    },
    
  ]
}

export default navigation
