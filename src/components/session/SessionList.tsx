import type { Project } from '../../types/session'
import { SessionCard } from './SessionCard'
import { Collapsible } from '../common/Collapsible'

interface Props {
  projects: Project[]
}

export function SessionList({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="p-4 text-sm text-[var(--text-muted)] text-center">
        No sessions loaded
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {projects.map(project => (
        <Collapsible
          key={project.encodedPath}
          title={project.decodedPath}
          defaultOpen={true}
          className="mb-2"
          titleClassName="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide px-2"
        >
          <div className="flex flex-col gap-0.5 mt-1">
            {project.sessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </Collapsible>
      ))}
    </div>
  )
}
