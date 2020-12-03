export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("huepals__state")
    if (serializedState === null) {
      return undefined
    } else {
      return JSON.parse(serializedState)
    }
  } catch {
    return undefined
  }
}
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem("huepals__state", serializedState)
  } catch (err) {
    console.log({ err })
  }
}
