import { format } from 'date-fns'

export default function formatDate(d) {
  return format(d, 'yyyyMMdd')
}
