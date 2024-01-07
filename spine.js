import { Database } from "bun:sqlite";

let db = new Database("todo.sqlite", { create: true, readwrite: true });
db.exec("PRAGMA journal_mode = WAL;"); // `bun:sqlite` docs said this line is recommended
// Creating Table
db.query(`CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task STRING NOT NULL,
  created DATE,
  status BOOLEAN NOT NULL DEFAULT FALSE
)`).run();

/**
 * Transaction C:
 * Short for CREATE. Used to CREATE a new Entry in database todo.
 * @param {number} i - id of the entry
 * @param {string} t - task's name (Mandatory)
 * @param {string} c - date created. Date is in String, format is Unix i think??
 * @param {boolean} s - status of the entry. (Completed or Incompleted)
 * @returns {Response} - An Empty Response, to make the Caller Happy (Makes me Sad :[)
 */
const C = db.transaction((i, t, c, s) => {
  db.query(`INSERT INTO todo (id, task, created, status)
    VALUES (?1, ?2, ?3, ?4)`).run(i, t, c, s);
  return new Response();
});
/**
 * Transaction R:
 * Short for READ. Used to READ todo database.
 * @returns {Response} - Contains Data in JSON format, grouped by Completeness (Marked by status)
 */
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
/**
 * Transaction U:
 * Short for UPDATE. Used to UPDATE a existing Entry in database todo.
 * @param {number} i - id of the entry (Mandatory)
 * @param {string} t - new task's name. Maybe `null`
 * @param {string} c - updated date created. Maybe `null`.
 * @param {boolean} s - updated status of the entry. Maybe `null`
 * @returns {Response} - An Empty Response. For the SAKE of Completeness
 */
const U = db.transaction((i, t, c, s) => {
  if (t!==null)
    db.query(`UPDATE todo SET task=?2 WHERE id=?1`).run(i, t);
  if (c!==null)
    db.query(`UPDATE todo SET created=?2 WHERE id=?1`).run(i, c);
  if (s!==null)
    db.query(`UPDATE todo SET status=?2 WHERE id=?1`).run(i, s);
  return new Response();
});
/**
 * Transaction D:
 * Short for DELETE. DELETEs an Entry.
 * @param {number} id - Entry's unique id.
 * @returns {Response} - Empty Again...
 */
const D = db.transaction((id) => {
  db.query(`DELETE FROM todo WHERE id=?1`).run(id);
  return new Response();
});

/**
 * To check the Existence of an id in Table. Not intended for use outside this file,
 * But you are not stopped from doing so. I used it to solve a messy problem I faced 
 * while writing the code. 
 * @param {number} id - id to be checked for existence.
 * @returns {boolean} True or False (We assume none of our data is in superposition :P)
 */
function exists(id) {
  return new Boolean(
    db.query(`SELECT EXISTS(SELECT 1 FROM todo WHERE id=?1 LIMIT 1)`)
      .get(id)[`EXISTS(SELECT 1 FROM todo WHERE id=?1 LIMIT 1`]
  )
}

// Listen for ^C event (Used to Shutdown Server).
process.on("SIGINT", async () => {
  console.log("Server Shutdown...");
  console.log(await Bun.readableStreamToJSON(R().body));
  db.close();
  process.exit();
});

// Main Code...
const server = Bun.serve({
  port: 6969, // 69 :P
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
            ); // UPDATE
          }
          else return C(
            body.id??null,
            body.task,
            body.created??null,
            body.status??false
          ); // CREATE
        }
        case 'GET': {
          if (pathname==='/')
            return R(); // READ
          else
            return D(+pathname.slice(1)); // DELETE
        }
        default: return Response.error(); // I hope this codepoint will never be reached...
      }
    } catch(e) {
      console.error("Error: ", e.message); // And this will hopefully never be triggerred :eyes:...
    }
  }
});

console.log(`Listening on localhost:${server.port}`);
// End of File, nothing to see here...