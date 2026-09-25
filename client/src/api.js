const API = "/api";

async function readJson(res, fallbackMessage) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || fallbackMessage);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error("API unreachable");
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API}/projects`);
  return readJson(res, "Could not load projects");
}

export async function createProject(payload) {
  const res = await fetch(`${API}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson(res, "Could not create project");
}

export async function updateProject(id, payload) {
  const res = await fetch(`${API}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson(res, "Could not save project");
}

export async function deleteProject(id) {
  const res = await fetch(`${API}/projects/${id}`, { method: "DELETE" });
  return readJson(res, "Could not delete project");
}
