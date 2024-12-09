import './styles.css'

import DOMPurify from 'dompurify'
import { X } from 'lucide-react'
import React, { InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import { useCustomTheme } from 'src/hooks/useTheme'
import { NumberSettings } from 'src/interfaces'

interface CustomInputProps {
  value: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  onChange: (_newValue: string) => void
  placeholder?: string
  numberSettings?: NumberSettings
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  type = 'text',
  onChange,
  placeholder = 'Click to edit',
  numberSettings,
}) => {
  const { theme } = useCustomTheme()

  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const formatDecimalNumber = (val: string) => {
    if (!val) return val
    const sanitizedValue = DOMPurify.sanitize(val)
    if (type === 'number') {
      if (sanitizedValue.startsWith('.')) {
        return `0${sanitizedValue}`
      }
      // Handle case where user is typing
      if (sanitizedValue === '-' || sanitizedValue === '.') {
        return sanitizedValue
      }
    }
    return sanitizedValue
  }

  const getFormattedValueWithUnit = (val: string) => {
    if (!val || !numberSettings?.unit) return val

    const unit =
      numberSettings.unit.symbol === 'custom'
        ? DOMPurify.sanitize(numberSettings.unit.custom_unit)
        : DOMPurify.sanitize(numberSettings.unit.symbol)

    return numberSettings.unit.direction === 'left'
      ? `${unit}${val}`
      : `${val}${unit}`
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    const formatted = formatDecimalNumber(value)
    setInputValue(formatted)
    setDisplayValue(
      type === 'number' && numberSettings?.unit
        ? getFormattedValueWithUnit(formatted)
        : formatted,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, type, numberSettings])

  const handleSave = () => {
    const formatted = formatDecimalNumber(inputValue)
    setIsEditing(false)
    setDisplayValue(
      type === 'number' && numberSettings?.unit
        ? getFormattedValueWithUnit(formatted)
        : formatted,
    )
    onChange(formatted)
  }

  const handleBlur = () => {
    handleSave()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave()
    } else if (event.key === 'Escape') {
      setIsEditing(false)
      const formatted = formatDecimalNumber(value)
      setInputValue(formatted)
      setDisplayValue(
        type === 'number' && numberSettings?.unit
          ? getFormattedValueWithUnit(formatted)
          : formatted,
      )
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = DOMPurify.sanitize(e.target.value)
    setInputValue(sanitizedValue)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setInputValue('')
    setDisplayValue('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div
      data-theme={theme}
      className={`customInput ${isHovered && !isEditing ? 'hoveredEditBox' : ''} ${isEditing ? 'editing' : ''}`}
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <span>{displayValue || DOMPurify.sanitize(placeholder)}</span>
          {displayValue && isHovered && (
            <button
              type="button"
              onClick={handleClear}
              className="clearButton"
              aria-label="Clear input"
            >
              <X size={16} color="#999" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomInput
