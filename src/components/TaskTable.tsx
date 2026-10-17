import type { TaskListItem } from '../../shared/tasks.ts'
import { formatLabel } from '../format.ts'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type TaskTableProps = {
  tasks: TaskListItem[]
}

export function TaskTable({ tasks }: TaskTableProps) {
  if (tasks.length === 0) {
    return <p className="muted">No tasks match these filters.</p>
  }

  return (
    <div className="table-scroll">
      <table className="task-table">
        <thead>
          <tr>
            <th scope="col">Summary</th>
            <th scope="col">Clinic</th>
            <th scope="col">Type</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.summary}</td>
              <td>{task.clinic.name}</td>
              <td>{formatLabel(task.type)}</td>
              <td>
                <span className={`badge priority-${task.priority}`}>
                  {formatLabel(task.priority)}
                </span>
              </td>
              <td>
                <span className={`badge status-${task.status}`}>
                  {formatLabel(task.status)}
                </span>
              </td>
              <td className="nowrap">
                <time dateTime={task.createdAt}>
                  {dateFormat.format(new Date(task.createdAt))}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
