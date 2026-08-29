// @vitest-environment jsdom
/** Workspace roster retry: the retry button must re-run the roster fetch. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WorkspaceView } from '../src/mobile/views/WorkspaceView.tsx'
import { listWorkspaces } from '../src/mobile/api.ts'

vi.mock('../src/mobile/api.ts', () => ({
  listWorkspaces: vi.fn(),
}))

const listWorkspacesMock = vi.mocked(listWorkspaces)

const workspaceRow = (id: string) => ({ workspaceId: id, title: `Workspace ${id}`, path: `/w/${id}` })

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('WorkspaceView retry', () => {
  it('re-fetches the roster when the retry button is clicked', async () => {
    listWorkspacesMock.mockRejectedValueOnce(new Error('network down'))
    listWorkspacesMock.mockResolvedValueOnce([workspaceRow('ws-1')] as never)

    render(<WorkspaceView onPick={() => {}} />)

    // First fetch fails -> error + retry button.
    await waitFor(() => expect(screen.getByText(/加载失败/)).toBeTruthy())
    expect(listWorkspacesMock).toHaveBeenCalledTimes(1)

    // Retry re-fetches and renders the roster.
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    await waitFor(() => expect(screen.getByText('Workspace ws-1')).toBeTruthy())
    expect(listWorkspacesMock).toHaveBeenCalledTimes(2)
  })
})
