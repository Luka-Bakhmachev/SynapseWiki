import { betterAuth } from "better-auth";
import { oneTap } from "better-auth/plugins/one-tap";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

function createAuth(env) {
  const required = [
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    const error = new Error(
      `Missing Worker configuration: ${missing.join(", ")}`,
    );
    error.status = 503;
    throw error;
  }

  return betterAuth({
    appName: "SynapseWiki",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: env.DB,
    trustedOrigins: [env.BETTER_AUTH_URL],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [oneTap()],
  });
}

function assertSameOrigin(request, env) {
  const appOrigin = new URL(env.BETTER_AUTH_URL).origin;
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin !== appOrigin) {
    throw httpError(403, "Cross-origin request denied.");
  }
}

async function requireUser(request, auth) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    throw httpError(401, "Sign in is required.");
  }
  return session.user;
}

async function readJson(request, maxBytes = 1_000_000) {
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw httpError(413, "Request body is too large.");
  }
  try {
    return JSON.parse(body);
  } catch {
    throw httpError(400, "Request body must be valid JSON.");
  }
}

function normalizeNote(note) {
  if (
    !note ||
    typeof note.id !== "string" ||
    note.id.length < 1 ||
    note.id.length > 128 ||
    typeof note.title !== "string" ||
    note.title.length > 500 ||
    typeof note.content !== "string" ||
    note.content.length > 500_000
  ) {
    throw httpError(400, "A note has invalid fields.");
  }

  const normalizeStringArray = (value) => {
    if (value === undefined) return [];
    if (
      !Array.isArray(value) ||
      value.length > 500 ||
      value.some((item) => typeof item !== "string" || item.length > 500)
    ) {
      throw httpError(400, "A note has invalid tags or links.");
    }
    return value;
  };

  return {
    id: note.id,
    title: note.title,
    path: typeof note.path === "string" ? note.path : null,
    content: note.content,
    tags: normalizeStringArray(note.tags),
    links: normalizeStringArray(note.links),
    isWikiImport: Boolean(note.isWikiImport),
    updatedAt:
      typeof note.updatedAt === "string"
        ? note.updatedAt
        : new Date().toISOString(),
  };
}

function projectIdFromPath(pathname) {
  const match = pathname.match(
    /^\/api\/projects\/([A-Za-z0-9_-]{1,128})(?:\/notes(?:\/([A-Za-z0-9_-]{1,128}))?)?$/,
  );
  return match
    ? { projectId: match[1], noteId: match[2] || null }
    : null;
}

async function projectExists(db, projectId, ownerId) {
  return db
    .prepare("SELECT id FROM projects WHERE id = ? AND owner_id = ?")
    .bind(projectId, ownerId)
    .first();
}

async function handleProjects(request, env, auth, user) {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/projects") {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT p.id, p.name, p.created_at AS createdAt,
                p.updated_at AS updatedAt, COUNT(n.id) AS noteCount
         FROM projects p
         LEFT JOIN project_notes n
           ON n.project_id = p.id AND n.owner_id = p.owner_id
         WHERE p.owner_id = ?
         GROUP BY p.id
         ORDER BY p.updated_at DESC`,
      )
        .bind(user.id)
        .all();
      return json({ projects: results });
    }

    if (request.method === "POST") {
      assertSameOrigin(request, env);
      const body = await readJson(request, 10_000);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 1 || name.length > 80) {
        throw httpError(400, "Project names must be between 1 and 80 characters.");
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO projects (id, owner_id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(owner_id, name) DO NOTHING`,
      )
        .bind(id, user.id, name, now, now)
        .run();
      const project = await env.DB.prepare(
        `SELECT id, name, created_at AS createdAt, updated_at AS updatedAt
         FROM projects WHERE owner_id = ? AND name = ?`,
      )
        .bind(user.id, name)
        .first();
      return json({ project }, project.id === id ? 201 : 200);
    }

    throw httpError(405, "Method not allowed.");
  }

  const route = projectIdFromPath(pathname);
  if (!route) throw httpError(404, "Not found.");

  const { projectId, noteId } = route;
  const project = await projectExists(env.DB, projectId, user.id);
  if (!project) throw httpError(404, "Project not found.");

  if (noteId === null && pathname.endsWith("/notes")) {
    if (request.method !== "GET" && request.method !== "PUT") {
      throw httpError(405, "Method not allowed.");
    }

    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, title, path, content, tags_json AS tagsJson,
                links_json AS linksJson, is_wiki_import AS isWikiImport,
                updated_at AS updatedAt
         FROM project_notes
         WHERE project_id = ? AND owner_id = ?
         ORDER BY updated_at DESC`,
      )
        .bind(projectId, user.id)
        .all();

      return json({
        notes: results.map((note) => ({
          id: note.id,
          title: note.title,
          path: note.path,
          content: note.content,
          tags: JSON.parse(note.tagsJson),
          links: JSON.parse(note.linksJson),
          isWikiImport: Boolean(note.isWikiImport),
          updatedAt: note.updatedAt,
        })),
      });
    }

    assertSameOrigin(request, env);
    const body = await readJson(request);
    if (!Array.isArray(body.notes) || body.notes.length > 500) {
      throw httpError(400, "A project can be saved with at most 500 notes at once.");
    }

    const notes = body.notes.map(normalizeNote);
    if (new Set(notes.map((note) => note.id)).size !== notes.length) {
      throw httpError(400, "Note IDs must be unique within a project.");
    }

    const statements = [
      env.DB.prepare(
        "UPDATE projects SET updated_at = ? WHERE id = ? AND owner_id = ?",
      ).bind(new Date().toISOString(), projectId, user.id),
      env.DB.prepare(
        "DELETE FROM project_notes WHERE project_id = ? AND owner_id = ?",
      ).bind(projectId, user.id),
      ...notes.map((note) =>
        env.DB.prepare(
          `INSERT INTO project_notes
            (project_id, owner_id, id, title, path, content, tags_json,
             links_json, is_wiki_import, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          projectId,
          user.id,
          note.id,
          note.title,
          note.path,
          note.content,
          JSON.stringify(note.tags),
          JSON.stringify(note.links),
          note.isWikiImport ? 1 : 0,
          note.updatedAt,
        ),
      ),
    ];

    await env.DB.batch(statements);
    return json({ saved: notes.length });
  }

  if (noteId === null && !pathname.endsWith("/notes")) {
    if (request.method === "PATCH") {
      assertSameOrigin(request, env);
      const body = await readJson(request, 10_000);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 1 || name.length > 80) {
        throw httpError(400, "Project names must be between 1 and 80 characters.");
      }
      const updatedAt = new Date().toISOString();
      await env.DB.prepare(
        "UPDATE projects SET name = ?, updated_at = ? WHERE id = ? AND owner_id = ?",
      )
        .bind(name, updatedAt, projectId, user.id)
        .run();
      return json({ project: { id: projectId, name, updatedAt } });
    }

    if (request.method === "DELETE") {
      assertSameOrigin(request, env);
      await env.DB.prepare(
        "DELETE FROM projects WHERE id = ? AND owner_id = ?",
      )
        .bind(projectId, user.id)
        .run();
      return json({ deleted: true });
    }

    throw httpError(405, "Method not allowed.");
  }

  if (!noteId) throw httpError(404, "Not found.");

  if (request.method === "PUT") {
    assertSameOrigin(request, env);
    const note = normalizeNote(await readJson(request));
    if (note.id !== noteId) throw httpError(400, "Note ID does not match the route.");

    await env.DB.batch([
      env.DB.prepare(
        "UPDATE projects SET updated_at = ? WHERE id = ? AND owner_id = ?",
      ).bind(new Date().toISOString(), projectId, user.id),
      env.DB.prepare(
        `INSERT INTO project_notes
          (project_id, owner_id, id, title, path, content, tags_json,
           links_json, is_wiki_import, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(project_id, id) DO UPDATE SET
           title = excluded.title,
           path = excluded.path,
           content = excluded.content,
           tags_json = excluded.tags_json,
           links_json = excluded.links_json,
           is_wiki_import = excluded.is_wiki_import,
           updated_at = excluded.updated_at
         WHERE project_notes.owner_id = excluded.owner_id`,
      ).bind(
        projectId,
        user.id,
        note.id,
        note.title,
        note.path,
        note.content,
        JSON.stringify(note.tags),
        JSON.stringify(note.links),
        note.isWikiImport ? 1 : 0,
        note.updatedAt,
      ),
    ]);

    return json({ saved: true });
  }

  if (request.method === "DELETE") {
    assertSameOrigin(request, env);
    await env.DB.prepare(
      "DELETE FROM project_notes WHERE project_id = ? AND owner_id = ? AND id = ?",
    )
      .bind(projectId, user.id, noteId)
      .run();
    return json({ deleted: true });
  }

  throw httpError(405, "Method not allowed.");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      const auth = createAuth(env);
      if (url.pathname.startsWith("/api/auth/")) {
        return await auth.handler(request);
      }

      const user = await requireUser(request, auth);
      if (request.method === "GET") {
        const origin = request.headers.get("Origin");
        if (origin && origin !== new URL(env.BETTER_AUTH_URL).origin) {
          throw httpError(403, "Cross-origin request denied.");
        }
      } else {
        assertSameOrigin(request, env);
      }

      return await handleProjects(request, env, auth, user);
    } catch (error) {
      const status = Number.isInteger(error?.status) ? error.status : 500;
      if (status >= 500) {
        console.error("API request failed:", error);
      }
      return json(
        { error: status === 500 ? "The request could not be completed." : error.message },
        status,
      );
    }
  },
};
