import { Database } from "bun:sqlite";

let db = new Database("todo.sqlite", { create: true, readwrite: true });
db.exec("PRAGMA journal_mode = WAL;");
db.query(`CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task STRING NOT NULL,
  created DATE,
  status BOOLEAN NOT NULL DEFAULT FALSE
)`).run();

const C = db.transaction((i, t, c, s) => {
  db.query(`INSERT INTO todo (id, task, created, status)
    VALUES (?1, ?2, ?3, ?4)`).run(i, t, c, s);
  return new Response();
});
const R = db.transaction(() => {
  const data = db.query(`SELECT * FROM todo`).all();
  let group = { completed: [], not_completed: [] };
  for (const d of data) {
    if (d.status==true) {
      group.completed.push(d);
    } else {
      group.not_completed.push(d);
    }
    d.status=undefined;
  }
  return Response.json(group);
});
const U = db.transaction((i, t, c, s) => {
  if (t!==null)
    db.query(`UPDATE todo SET task=?2 WHERE id=?1`).run(i, t);
  if (c!==null)
    db.query(`UPDATE todo SET created=?2 WHERE id=?1`).run(i, c);
  if (s!==null)
    db.query(`UPDATE todo SET status=?2 WHERE id=?1`).run(i, s);
  return new Response();
});
const D = db.transaction((id) => {
  db.query(`DELETE FROM todo WHERE id=?1`).run(id);
  return new Response();
});

function exists(id) {
  return new Boolean(
    db.query(`SELECT EXISTS(SELECT 1 FROM todo WHERE id=?1 LIMIT 1)`)
      .get(id)[`EXISTS(SELECT 1 FROM todo WHERE id=?1 LIMIT 1`]
  )
}

process.on("SIGINT", async () => {
  console.log("Server Shutdown...");
  console.log(await Bun.readableStreamToJSON(R().body));
  db.close();
  process.exit();
});

const server = Bun.serve({
  port: 6969, // 69
  async fetch(req) {
    const {method} = req;
    const {pathname} = new URL(req.url);

    console.log(method, pathname);

    try {
      switch (method) {
        case 'POST': {
          const body = await Bun.readableStreamToJSON(req.body);
          console.log(body);
          if (exists(body.id)) {
            return U(
              body.id,
              body.task??null,
              body.created??null,
              body.status??null
            )
          }
          else return C(
            body.id??null,
            body.task,
            body.created??null,
            body.status??false
          );
        }
        case 'GET': {
          if (pathname==='/')
            return R();
          else
            return D(+pathname.slice(1));
        }
        default: return Response.error();
      }
    } catch(e) {
      console.error("Error: ", e.message);
    }
  }
});

console.log(`Listening on localhost:${server.port}`);
