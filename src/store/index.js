// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'
import admin from 'src/store/apps/admin'
import vendor from 'src/store/apps/vendor'
import customer from 'src/store/apps/customer'
import filters from 'src/store/apps/filters'
import stations from 'src/store/apps/stations'
import category from 'src/store/apps/category'
import mainCategories from 'src/store/apps/main-categories'
import bannerAds from 'src/store/apps/banner-ads'
import advertisements from 'src/store/apps/advertisement'
import transaction from 'src/store/apps/transaction'

export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    invoice,
    calendar,
    admin,
    permissions,
    vendor,
    customer,
    filters,
    stations,
    category,
    mainCategories,
    bannerAds,
    advertisements,
    transaction
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
