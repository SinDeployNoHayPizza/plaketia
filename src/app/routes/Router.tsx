import { ProjectManagerScreen } from '@/screens/ProjectManager/ProjectManagerScreen.tsx'

type Screen = 'projectManager'

interface RouterState {
  currentScreen: Screen
  navigate: (screen: Screen) => void
}

let currentState: RouterState = {
  currentScreen: 'projectManager',
  navigate: () => {},
}

export function getRouter(): RouterState {
  return currentState
}

export function Router() {
  currentState = {
    currentScreen: 'projectManager',
    navigate: () => {},
  }

  const screen = currentState.currentScreen

  switch (screen) {
    case 'projectManager':
      return <ProjectManagerScreen />
    default:
      return <ProjectManagerScreen />
  }
}
