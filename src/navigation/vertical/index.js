import { subject } from "@casl/ability"
import { sub } from "date-fns"
import { act } from "react"

const navigation = () => {
  return [
    {
      title: 'Admin',
      icon: 'tabler:users',
      path: '/apps/admin/list',
         action: 'manage',
          subject: 'admin',
    },
 
    {
       title: 'Users',
      icon: 'tabler:user-circle',
      children: [
        {
          title: 'Vendor',
          path: '/apps/users/vendor',
            action: 'manage',
          subject: 'manage user',
        },
        {
          title: 'Customer',
          path: '/apps/users/customer',
            action: 'manage',
          subject: 'manage user',
        }
      ]
    },
     {
      title: 'Stations',
      icon: 'tabler:gas-station',
       path: '/apps/stations/list',
       action: 'manage',
      subject: 'manage station',
    },
   {
      title: 'Filters',
      icon: 'tabler:filter',
     path: '/apps/filters/list',
     action: 'manage',
      subject:'manage filter'
  },
  {
      title: 'Category',
      icon: 'tabler:category',
    path: '/apps/categories/list',
    action: 'manage',
      subject:'manage category'
    },
    {
      title: 'Main Categories',
      icon: 'tabler:category-2',
      path: '/apps/main-categories/list',
      action: 'manage',
      subject:'manage category'
    },
       {
      title: 'Banner Ads',
      icon: 'tabler:speakerphone',
         path: '/apps/banner-ads/list',
         action: 'manage',
         subject: 'manage banner ad'
    },
    {
      title: 'Advertisement',
      icon: 'tabler:slideshow',
      path: '/apps/advertisement/list',
      action: 'manage',
      subject:'review advertisement'
    },
  {
      title: 'Transactions',
      icon: 'tabler:transaction-dollar',
    path: '/apps/transactions/list',
    action: 'manage',
      subject:'transaction'
    },
    
  ]
}

export default navigation
