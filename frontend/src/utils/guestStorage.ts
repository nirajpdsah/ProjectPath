export interface GuestProject {
  id: string
  name: string
  method: 'CPM' | 'PERT'
  timeUnit: string
  createdAt: string
  updatedAt: string
}

export interface GuestActivity {
  id: string
  projectId: string
  activityId: string
  name: string
  predecessors?: string | null
  duration?: number | null
  optimistic?: number | null
  mostLikely?: number | null
  pessimistic?: number | null
  cost?: number | null
  crashTime?: number | null
  crashCost?: number | null
}

const PROJECTS_KEY = 'guest_projects'
const activitiesKey = (projectId: string) => `guest_activities_${projectId}`

export function getGuestProjects(): GuestProject[] {
  const raw = localStorage.getItem(PROJECTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as GuestProject[]
  } catch {
    return []
  }
}

export function saveGuestProjects(projects: GuestProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function addGuestProject(project: GuestProject) {
  const projects = getGuestProjects()
  projects.unshift(project)
  saveGuestProjects(projects)
}

export function deleteGuestProject(projectId: string) {
  const projects = getGuestProjects().filter(p => p.id !== projectId)
  saveGuestProjects(projects)
  localStorage.removeItem(activitiesKey(projectId))
}

export function getGuestProject(projectId: string): GuestProject | null {
  return getGuestProjects().find(p => p.id === projectId) || null
}

export function getGuestActivities(projectId: string): GuestActivity[] {
  const raw = localStorage.getItem(activitiesKey(projectId))
  if (!raw) return []
  try {
    return JSON.parse(raw) as GuestActivity[]
  } catch {
    return []
  }
}

export function saveGuestActivities(projectId: string, activities: GuestActivity[]) {
  localStorage.setItem(activitiesKey(projectId), JSON.stringify(activities))
}

export function addGuestActivity(projectId: string, activity: GuestActivity) {
  const activities = getGuestActivities(projectId)
  activities.push(activity)
  saveGuestActivities(projectId, activities)
}

export function deleteGuestActivity(projectId: string, activityId: string) {
  const activities = getGuestActivities(projectId).filter(a => a.id !== activityId)
  saveGuestActivities(projectId, activities)
}
