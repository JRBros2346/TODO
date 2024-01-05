import { test, expect, describe } from "bun:test"

describe("given", ()=>{
  test("demo", async done => {
    // fetch("https://localhost:6969/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     id: "10121",
    //     task: "Wash dishes",
    //     created: "2023-01-05",
    //   }),
    // });
    // fetch("https://localhost:6969/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     id: "10121",
    //     status: "true",
    //   }),
    // });
    const res = await fetch("https://localhost:6969/");
    const data = await res.json();
    console.log(data);
    done()
  });
});