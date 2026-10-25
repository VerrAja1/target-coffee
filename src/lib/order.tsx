/* eslint-disable react-refresh/only-export-components -- provider and its hook live together on purpose */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { getMenuItem } from '../data/menu'
import type { AddOnId } from '../data/menu.types'
import { calculateBill, itemCount } from './money'
import type { Bill, BillLine } from './money'

export interface OrderLine extends BillLine {
  key: string
}

interface OrderState {
  lines: OrderLine[]
}

type OrderAction =
  | { type: 'add'; itemId: string; unitPrice: number; addOnIds: AddOnId[]; quantity: number }
  | { type: 'increment'; key: string }
  | { type: 'decrement'; key: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

function lineKey(itemId: string, addOnIds: readonly AddOnId[]): string {
  return `${itemId}__${[...addOnIds].sort().join('.')}`
}

function reducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.itemId, action.addOnIds)
      const existing = state.lines.find((line) => line.key === key)
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + action.quantity } : line,
          ),
        }
      }
      return {
        lines: [
          ...state.lines,
          {
            key,
            itemId: action.itemId,
            unitPrice: action.unitPrice,
            addOnIds: action.addOnIds,
            quantity: action.quantity,
          },
        ],
      }
    }
    case 'increment':
      return {
        lines: state.lines.map((line) =>
          line.key === action.key ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      }
    case 'decrement':
      return {
        lines: state.lines
          .map((line) =>
            line.key === action.key ? { ...line, quantity: line.quantity - 1 } : line,
          )
          .filter((line) => line.quantity > 0),
      }
    case 'remove':
      return { lines: state.lines.filter((line) => line.key !== action.key) }
    case 'clear':
      return { lines: [] }
    default:
      return state
  }
}

interface OrderValue {
  lines: OrderLine[]
  bill: Bill
  count: number
  isOpen: boolean
  lastAdded: { itemId: string; token: number } | null
  addItem: (itemId: string, addOnIds?: AddOnId[], quantity?: number) => void
  increment: (key: string) => void
  decrement: (key: string) => void
  remove: (key: string) => void
  clear: () => void
  openOrder: () => void
  closeOrder: () => void
}

const OrderContext = createContext<OrderValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<{ itemId: string; token: number } | null>(null)

  const addItem = useCallback((itemId: string, addOnIds: AddOnId[] = [], quantity = 1) => {
    const item = getMenuItem(itemId)
    if (!item) return
    dispatch({ type: 'add', itemId, unitPrice: item.price, addOnIds, quantity })
    setLastAdded((previous) => ({ itemId, token: (previous?.token ?? 0) + 1 }))
  }, [])

  const value = useMemo<OrderValue>(() => {
    const bill = calculateBill(state.lines)
    return {
      lines: state.lines,
      bill,
      count: itemCount(state.lines),
      isOpen,
      lastAdded,
      addItem,
      increment: (key) => dispatch({ type: 'increment', key }),
      decrement: (key) => dispatch({ type: 'decrement', key }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      openOrder: () => setIsOpen(true),
      closeOrder: () => setIsOpen(false),
    }
  }, [state.lines, isOpen, lastAdded, addItem])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder(): OrderValue {
  const value = useContext(OrderContext)
  if (!value) throw new Error('useOrder must be used inside OrderProvider')
  return value
}
