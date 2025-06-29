import { AbilityBuilder, Ability } from '@casl/ability'
import { use } from 'react'
import { useAuth } from 'src/hooks/useAuth'

export const AppAbility = Ability

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role, subject,permissions) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  if (role === 'super-admin') {
    can('manage', 'all')
  } else if (role === 'station') {
    can(['manage'], 'transaction')
  }
  else if (role === 'admin') {
    permissions.map(permission=>{
      console.log(permission);
      if (permission.have == 1)
      {
can(['manage'], permission.name)
      }
      
    })
  }
  else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role, subject) => {
const { user } = useAuth()
console.log(user.permissions);
  return new AppAbility(defineRulesFor(role, subject,user.permissions), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object.type
  })
}

export const defaultACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
