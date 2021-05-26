# Test performance

After trying to update parse server to 4.x in production I notice a very slow response time. So I created this simple test to reproduce the problem found.

## Preparation

```
$ npm install -g mongodb-runner
$ mongodb-runner start
```

## Execution:
- Clone this repo
- $ npm i


## parse-server@3.10.0

```
Created 300 accounts in parallel through cloud function (Installation + User + Account)
accounts: 6.773s
Created 400 myObjects in parallel
objectsP: 658.257ms
Created 400 myObjects in sequence
objectsS: 1.320s
```

## parse-server@4.5.0

```
Created 300 accounts in parallel through cloud function (Installation + User + Account)
accounts: 19.303s
Created 400 myObjects in parallel
objectsP: 7.482s
Created 400 myObjects in sequence
objectsS: 4.174s
```


