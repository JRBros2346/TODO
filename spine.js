import { Database } from "bun:sqlite";

let db = new Database("todo.sqlite", { create: true, readwrite: true });
db.exec("PRAGMA journal_mode = WAL;");
db.query(`CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task STRING NOT NULL,
  created DATE DEFAULT(CURRENT_DATE),
  status BOOLEAN DEFAULT FALSE
)`).run();

const C = db.transaction(item => {
  db.query(`INSERT INTO todo (id, task, created, status)
    VALUES ($i, $t, $c, $s)`).run(item);
  return new Response('[]');
});
const R = db.transaction(() => {
  return JSON.stringify(db.query(`SELECT * FROM todo`).all());
});
const U = db.transaction(item => {
  db.query(`UPDATE todo SET task=$t, created=$c, status=$s WHERE id=$i`).run(item);
  return new Response('[]');
});
const D = db.transaction((id) => {
  db.query(`DELETE FROM todo WHERE id=?1`).run(id);
  return new Response('[]');
});

process.on("SIGINT", () => {
  console.log("Server Shutdown...");
  console.log(R());
  db.close();
  process.exit();
});

const server = Bun.serve({
  port: 6969, // 69
  fetch(req) {
    console.log(req);
    if (req.body===null) {
      const url = new URL(req.url);
      if (url.pathname==='/')
        return R();
      else return D(url.pathname.substring(1));
    } else {
      const body = JSON.parse(req.body, (k, v) => {
        if (k==="created") return new Date(v);
        return v;
      });
      if (db.query(`SELECT TOP 1 1 FROM products WHERE id=$i`).get(body.id)===undefined)
        return C({
          $i: body.id,
          $t: body.task,
          $c: body.created,
          $s: body.status,
        });
      else return U({
        $i: body.id,
        $t: body.task,
        $c: body.created,
        $s: body.status,
      });
    }
  }
});

console.log(`Listening on localhost:${server.port}`);
