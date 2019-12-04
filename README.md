# fake-server

Responds to GET and POST requests with response bodies of user-requestable size.

e.g. a GET request where the server delays the request 100ms and responds with a 200 byte body
```
curl localhost:3000/fake-server/get/100/200
```

## Build

Push to the fake-server ECR repo in your AWS account
```
aws-mfa
./build_and_push_image.sh v1.0.N
```