import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
} from 'react'
import { useEffect, useRef, useState } from 'react'

type Tag = {
  id: number | string
  text: string
}

type Props = {
  suggestions: Array<Tag>
  onTagDelete: (id: number | string) => void
  onTagAdd: (item: Tag) => void
  tags: Array<Tag>
  inputId?: string
}

export function TagInput({
  tags,
  suggestions,
  onTagDelete,
  onTagAdd,
  inputId,
}: Props) {
  const [displayedSuggestions, setDisplayedSuggestions] = useState<Tag[]>([])
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      displayedSuggestions.length > 0 &&
      suggestionListRef.current &&
      focusedSuggestionIndex > -1
    ) {
      const targetElement = suggestionListRef.current.children[
        focusedSuggestionIndex
      ] as HTMLButtonElement
      targetElement.focus()
    }
  }, [displayedSuggestions, focusedSuggestionIndex])

  const clearSuggestions = () => {
    setDisplayedSuggestions([])
    setFocusedSuggestionIndex(-1)
  }

  const onSelectSuggestion = (newTag: Tag) => {
    clearSuggestions()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onTagAdd(newTag)
  }

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.key === 'Enter' && inputRef.current) {
      evt.preventDefault()
      if (displayedSuggestions.length > 0) {
        const newTag = displayedSuggestions[0]
        onTagAdd(newTag)
      }
      clearSuggestions()
      inputRef.current.value = ''
    } else if (evt.key === 'ArrowDown' && suggestionListRef.current) {
      setFocusedSuggestionIndex(0)
    }
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const { value } = evt.target
    if (value.length >= 3) {
      const filteredSuggestions = suggestions.filter(({ text }) =>
        text.toLowerCase().startsWith(value.toLowerCase()),
      )
      setDisplayedSuggestions(filteredSuggestions.slice(0, 3))
      setFocusedSuggestionIndex(-1)
    } else {
      clearSuggestions()
    }
  }

  const onBlur: FocusEventHandler<HTMLDivElement> = (evt) => {
    if (!evt.currentTarget.contains(evt.relatedTarget)) {
      clearSuggestions()
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const onSuggestionsKeyDown: KeyboardEventHandler<HTMLDivElement> = (evt) => {
    if (!suggestionListRef.current) {
      return
    }
    if (evt.key === 'ArrowDown') {
      setFocusedSuggestionIndex(
        Math.min(focusedSuggestionIndex + 1, displayedSuggestions.length - 1),
      )
    } else if (evt.key === 'ArrowUp') {
      setFocusedSuggestionIndex(Math.max(focusedSuggestionIndex - 1, 0))
    }
  }

  const renderTag = ({ id, text }: Tag) => (
    <div
      key={id}
      className="flex rounded bg-light-grey p-1 text-xs uppercase gap-2 items-center h-fit"
    >
      <span>{text}</span>
      <button
        type="button"
        onClick={() => {
          onTagDelete(id)
        }}
        className="text-xxs font-extrabold cursor-pointer"
        aria-label="Remove"
      >
        <span aria-hidden="true">X</span>
      </button>
    </div>
  )

  const renderSuggestion = (suggestion: Tag) => (
    <button
      className="btn btn-ghost p-2 h-fit min-h-0 justify-left focus:outline-dashed focus:outline focus:outline-offset-0 focus:outline-1 rounded-none m-1"
      key={suggestion.id}
      onClick={() => onSelectSuggestion(suggestion)}
    >
      {suggestion.text}
    </button>
  )

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="input bg-white flex flex-row flex-wrap py-2 gap-2 min-h-[128px] content-start"
    >
      {tags.map(renderTag)}
      <div className="relative h-fit" onBlur={onBlur}>
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          onChange={onChange}
          className="focus:outline-dashed"
          id={inputId}
        />
        {displayedSuggestions.length > 0 && (
          <div
            className="absolute left-0 top-6 bg-white flex flex-col w-full border border-black rounded"
            ref={suggestionListRef}
            onKeyDown={onSuggestionsKeyDown}
          >
            {displayedSuggestions.map(renderSuggestion)}
          </div>
        )}
      </div>
    </div>
  )
}

export type { Tag }
