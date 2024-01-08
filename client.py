import http.client, json

con = http.client.HTTPConnection("localhost", 6969, 5)

def C(t, i=None, c=None, s=False):
    data = json.dumps({
        "id": i,
        "task": t,
        "created": c,
        "status": s,
    })
    print("POST /", data)
    con.request("POST", "/", data, {"Content-Type": "application/json"})
    print(con.getresponse().read().decode())
def R():
    print("GET /")
    con.request("GET", "/")
    print(json.loads(con.getresponse().read()))
def U(i, t=None, c=None, s=None):
    data = json.dumps({
        "id": i,
        "task": t,
        "created": c,
        "status": s,
    })
    print("PUT /", data)
    con.request("PUT", "/", data, {"Content-Type": "application/json"})
    print(json.loads(con.getresponse().read()))
def D(id):
    print("DELETE /{}".format(id))
    con.request("DELETE", "/{}".format(id))
    print(json.loads(con.getresponse().read()))