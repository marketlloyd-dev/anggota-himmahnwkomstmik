export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getRoleBadgeColor(role) {
  switch (role) {
    case 'ketua': return 'bg-yellow-700'
    case 'sekretaris': return 'bg-blue-700'
    case 'bendahara': return 'bg-green-700'
    default: return 'bg-gray-700'
  }
}