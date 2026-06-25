import { observer } from "mobx-react"
import state from "./state"
import ThemePreview from "./ThemePreview"
import Button from "./Button"
import { Icon } from "@iconify/react"
import addIcon from "@iconify-icons/solar/folder-2-bold-duotone"
import restoreIcon from "@iconify-icons/solar/clock-circle-bold-duotone"
import heartBold from "@iconify-icons/solar/heart-bold"
import swatchesBold from "@iconify-icons/solar/palette-bold-duotone"

const App = observer(() => {
  return (
    <div className="Overview">
      {[
        {
          key: "favorites",
          label: (
            <>
              <Icon icon={heartBold} /> Favorites
            </>
          ),
          themes: state.themes.filter((theme) => theme.favorite),
        },
        {
          key: "all",
          label: (
            <>
              <Icon icon={swatchesBold} /> All
            </>
          ),
          themes: state.themes.filter((theme) => !theme.favorite),
        },
      ].map(
        (group) => {
          if (group.key === "favorites" && !group.themes.length) return null
          return (<>
            <h2 className="themes-header">{group.label}</h2>
            <div className="themes">
              {group.themes.map((theme) => (
                <ThemePreview
                  theme={theme}
                  onDoubleClick={() => state.ui.setCurrentTheme(theme)}
                />
              ))}
              {group.key === "all" && (
                <Button
                  onClick={() => {
                    state.addTheme()
                  }}
                  label={
                    <>
                      <Icon height={`${1.25 ** 2}em`} icon={addIcon} />
                      <span>New Theme</span>
                    </>
                  }
                />
              )}
            </div>
          </>)
        }
      )}
      <Button
        status="danger"
        onClick={() => {
          state.resetStore()
        }}
        label={
          <>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Reset All</span>
          </>
        }
        confirmLabel={
          <>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Are you sure?</span>
          </>
        }
      />
    </div>
  )
})

export default App
