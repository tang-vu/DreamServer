import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import './panel-select.css'

// Inline (not portalled) so long labels can never expand into the chat pane.
export default function PanelSelect({ label, value, onChange, options, disabled = false }) {
  const id = useId(), root = useRef(null), trigger = useRef(null)
  const [open, setOpen] = useState(false)
  const typed = useRef({text:'', time:0})
  const [activeValue, setActiveValue] = useState(null)
  const selected = options.findIndex(option => option.value === value)
  const highlighted = options.findIndex(option => option.value === activeValue)
  const active = highlighted < 0 ? Math.max(0, selected) : highlighted
  const expanded = open && !disabled && options.length > 0
  const choose = index => {
    if (disabled || !options[index]) return
    onChange(options[index].value)
    setOpen(false)
    trigger.current?.focus()
  }
  useEffect(() => {
    if (!open) return
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => {
    if (expanded) root.current?.querySelector(`[id="${id}-option-${active}"]`)?.scrollIntoView?.({ block: 'nearest' })
  }, [expanded, active, id])
  const keyDown = event => {
    if (disabled || !options.length || event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key.length === 1 && event.key !== ' ') {
      event.preventDefault()
      const time = Date.now()
      const text = (open && time - typed.current.time < 700 ? typed.current.text : '') + event.key.toLocaleLowerCase()
      typed.current = {text:text.slice(0, 256), time}
      const repeated = [...text].every(char => char === text[0])
      const prefix = repeated ? text[0] : text
      const from = open ? active : Math.max(0, selected)
      for (let step = repeated ? 1 : 0; step < options.length + (repeated ? 1 : 0); step++) {
        const index = (from + step) % options.length
        if (options[index].label.toLocaleLowerCase().startsWith(prefix)) {
          setActiveValue(options[index].value); setOpen(true); break
        }
      }
      return
    }
    typed.current = {text:'', time:0}
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return }
    if (event.key === 'Tab') { setOpen(false); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      setOpen(true)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : !expanded ? Math.max(0, selected)
          : Math.max(0, Math.min(options.length - 1, active + (event.key === 'ArrowDown' ? 1 : -1)))
      setActiveValue(options[next].value)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault(); choose(active)
    }
  }
  return <div className="panel-select" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <button ref={trigger} type="button" role="combobox" aria-label={label} aria-expanded={expanded}
      aria-controls={`${id}-list`} aria-haspopup="listbox" aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
      disabled={disabled || !options.length} onKeyDown={keyDown}
      onClick={() => { setActiveValue(options[Math.max(0, selected)]?.value); setOpen(!expanded) }}>
      <span>{options[selected]?.label || 'No matching categories'}</span><ChevronDown size={14} />
    </button>
    {expanded && <div id={`${id}-list`} role="listbox" aria-label={label} className="panel-select-options">
      {options.map((option, index) => <div key={option.value}>
        {option.group && option.group !== options[index - 1]?.group && <div className="panel-select-group">{option.group}</div>}
        <div id={`${id}-option-${index}`} role="option" aria-selected={option.value === value}
          className={active === index ? 'is-highlighted' : ''} onPointerDown={event => event.preventDefault()}
          onMouseEnter={() => setActiveValue(option.value)} onClick={() => choose(index)}>
          <span>{option.label}</span>{option.value === value && <Check size={13} />}
        </div>
      </div>)}
    </div>}
  </div>
}
