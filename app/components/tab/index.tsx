import cx from 'classnames'
import { FC, ReactElement, ReactNode, useState } from 'react'

interface TabProps {
  id: string
  title: string
  children: ReactNode
}

export const Tab: FC<TabProps> = ({ children }) => <>{children}</>

interface Props {
  children: ReactElement<TabProps>[]
  onTabChanged?: (id: string) => void
}

export const TabGroup: FC<Props> = ({ children, onTabChanged }) => {
  const tabId = (children.length && children[0].props.id) || ''
  const [activeTab, setActiveTab] = useState<string>(tabId)

  const onChangeTab = (id: string): void => {
    setActiveTab(id)
    onTabChanged && onTabChanged(id)
  }

  return (
    <div className="h-full p-8">
      <ul className="mb-4 flex w-fit list-none flex-row gap-2 p-0">
        {children.map((tab) => (
          <li key={tab.props.id} className="w-full">
            <button
              onClick={() => onChangeTab(tab.props.id)}
              className={cx(
                'w-full rounded-xl px-8 py-2 font-medium text-primary transition duration-300 hover:bg-primary hover:text-white',
                activeTab !== tab.props.id && '',
                activeTab === tab.props.id && 'bg-primary text-white',
              )}
            >
              {tab.props.title}
            </button>
          </li>
        ))}
      </ul>
      {children.map((tab) => {
        const shouldShowContent = activeTab === tab.props.id
        return shouldShowContent && tab
      })}
    </div>
  )
}
