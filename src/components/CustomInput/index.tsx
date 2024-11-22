import './styles.css'

import DOMPurify from 'dompurify'
import { X } from 'lucide-react'
import React, {
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [inputValue, setInputValue] = useState(DOMPurify.sanitize(value))
  const inputRef = useRef<HTMLInputElement>(null)

  const formattedValue = useMemo(() => {
    const sanitizedValue = DOMPurify.sanitize(inputValue)

    if (
      type !== 'number' ||
      !numberSettings ||
      !numberSettings.unit ||
      !sanitizedValue
    ) {
      return sanitizedValue
    }

    if (numberSettings.unit.symbol === 'custom') {
      numberSettings.unit.symbol = DOMPurify.sanitize(
        numberSettings.unit.custom_unit,
      )
    }

    if (numberSettings.unit.direction === 'left') {
      return `${DOMPurify.sanitize(numberSettings.unit.symbol)}${sanitizedValue}`
    }

    return `${sanitizedValue}${DOMPurify.sanitize(numberSettings.unit.symbol)}`
  }, [type, numberSettings, inputValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    onChange(DOMPurify.sanitize(inputValue))
  }

  const handleBlur = () => {
    handleSave()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave()
    } else if (event.key === 'Escape') {
      setIsEditing(false)
      setInputValue(DOMPurify.sanitize(value))
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    setInputValue(DOMPurify.sanitize(value))
  }, [value])

  return (
    <div
      className={`customInput ${isHovered && !isEditing ? 'hoveredEditBox' : ''}`}
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(DOMPurify.sanitize(e.target.value))}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <span
            style={{
              color: inputValue ? 'black' : 'gray',
            }}
          >
            {formattedValue || DOMPurify.sanitize(placeholder)}
          </span>
          {inputValue && isHovered && (
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
