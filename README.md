# fake-server

Responds to GET and POST requests with response bodies of user-requestable size.

e.g. a GET request where the server delays the request 100ms and responds with a 200 byte body
```
curl localhost:3000/api/get/100/200
```