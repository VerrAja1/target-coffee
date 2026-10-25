import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

/**
 * Native <dialog> so Escape, focus trapping, and the backdrop are browser
 * behaviour instead of a hand-rolled imitation.
 */
export function Dialog({ open, onClose, label, children, className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const restoreOverflow = useRef('')

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      restoreOverflow.current = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
      document.documentElement.style.overflow = restoreOverflow.current
    }

    return () => {
      if (dialog.open) dialog.close()
      document.documentElement.style.overflow = restoreOverflow.current
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose()
    }

    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('click', onClick)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('click', onClick)
    }
  }, [onClose])

  return (
    <dialog ref={ref} aria-label={label} className={`fixed inset-0 size-full ${className}`}>
      {open ? children : null}
    </dialog>
  )
}
