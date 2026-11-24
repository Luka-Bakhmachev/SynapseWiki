async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error || `Request failed (${response.status}).`);
  }
  return result;
}

const noteSaveQueues = new Map();

export const listProjects = async () =>
  (await request("/api/projects")).projects;

export const createProject = async (name) =>
  (await request("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  })).project;

export const renameProject = async (id, name) =>
  (await request(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  })).project;

export const deleteProject = async (id) =>
  request(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });

export const getProjectNotes = async (projectId) =>
  (await request(
    `/api/projects/${encodeURIComponent(projectId)}/notes`,
  )).notes;

export const replaceProjectNotes = async (projectId, notes) =>
  request(`/api/projects/${encodeURIComponent(projectId)}/notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });

export const saveProjectNote = (projectId, note) => {
  const key = `${projectId}:${note.id}`;
  const previous = noteSaveQueues.get(key) || Promise.resolve();
  const current = previous
    .catch(() => undefined)
    .then(() =>
      request(
        `/api/projects/${encodeURIComponent(projectId)}/notes/${encodeURIComponent(note.id)}`,
        {
          method: "PUT",
          body: JSON.stringify(note),
        },
      ),
    );
  noteSaveQueues.set(key, current);
  return current.finally(() => {
    if (noteSaveQueues.get(key) === current) noteSaveQueues.delete(key);
  });
};

export const deleteProjectNote = async (projectId, noteId) =>
  request(
    `/api/projects/${encodeURIComponent(projectId)}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
