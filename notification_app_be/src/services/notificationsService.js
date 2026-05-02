/**
 * Notification service layer.
 * Currently returns placeholder data — replace with database or external API calls.
 */

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'placement',
    title: 'New placement opportunity at Google',
    description: 'Software Engineer role — apply by June 15',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'result',
    title: 'Semester results published',
    description: 'Check your grades on the portal',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'event',
    title: 'Tech talk: System Design at Scale',
    description: 'Join us on Friday at 3 PM in the auditorium',
    timestamp: new Date().toISOString(),
  },
]

/**
 * @returns {Promise<object[]>}
 */
export async function getAll() {
  // TODO: Replace with database query or external API call
  return MOCK_NOTIFICATIONS
}

/**
 * @param {string} id
 * @returns {Promise<object | undefined>}
 */
export async function getById(id) {
  // TODO: Replace with database lookup
  return MOCK_NOTIFICATIONS.find((n) => n.id === id)
}
