import './styles.css'

import { uniqueId } from 'lodash'
import { Toast } from 'monday-ui-react-core'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface ToastProps {
  id: string
  loading?: boolean
  timeToLive?: number
  type?: 'normal' | 'positive' | 'negative' | 'warning' | 'dark'
  message: string
}

interface ToastContextData {
  addToast: (_toastProps: Omit<ToastProps, 'id'>) => string
  removeToast: (_id: string) => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Array<ToastProps>>([])

  const addToast = (toastProps: Omit<ToastProps, 'id'>) => {
    const id = uniqueId()

    const toast: ToastProps = {
      id,
      ...toastProps,
    }

    setToasts([...toasts, toast])

    if (toast.timeToLive) {
      setTimeout(() => {
        removeToast(id)
      }, toast.timeToLive)
    }

    return id
  }

  const removeToast = (id: string) => {
    // Set the toast with the given id to closed
    setToasts(
      toasts.filter((toast) => {
        if (toast.id === id) {
          return false
        }
        return true
      }),
    )
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type as any}
          open={true}
          loading={toast.loading}
          onClose={() => removeToast(toast.id)}
          className="custom-toast"
          closeable={false}
        >
          {toast.message}
        </Toast>
      ))}
      {children}
    </ToastContext.Provider>
  )
}
