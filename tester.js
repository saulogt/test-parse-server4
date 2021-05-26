const Parse = require("parse/node");
const server = require("./server");
const uuid = require("uuid").v1;

const MyClass = Parse.Object.extend("MyClass");

Parse.initialize(server.appId, null, server.masterKey);
Parse.serverURL = server.serverURL;

async function createAccounts(n) {
  const accounts = await Promise.all(
    Array.apply(null, Array(n)).map(() => {
      const username = uuid();
      return userCreateWithAccount();
    })
  );
  return accounts;
}

function createObjectsP(n, a) {
  const objcts = Array.apply(null, Array(n)).map(() => {
    const o = mkValidObject();
    o.set("account", a.user.account);
    return o.save(null, { sessionToken: a.user.getSessionToken() });
  });
  return objcts;
}

async function createObjectsS(n, a) {
  const objcts = Array.apply(null, Array(n)).map(() => {
    const o = mkValidObject();
    o.set("account", a.user.account);
    return o;
  });

  for (const o of objcts) {
    await o.save(null, { sessionToken: a.user.getSessionToken() });
  }
}

go();

async function go() {
  console.time("accounts");
  const accounts = await createAccounts(150);
  console.timeEnd("accounts");
  try {
    console.time("objectsP");
    await Promise.all(createObjectsP(300, accounts[0]));
    console.timeEnd("objectsP");

    console.time("objectsS");
    await createObjectsS(300, accounts[0]);
    console.timeEnd("objectsS");
  } catch (err) {
    console.error(err);
  }
}

function invokeCloudFunction(name, params, sessionToken) {
  return new Promise((resolve, reject) => {
    const options = {};
    if (sessionToken) {
      options.sessionToken = sessionToken;
    }
    return Parse.Cloud.run(name, params, options)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        // Don't expose Parse.Error, it doesn't inherit from Error, rollbar does not like
        if (err instanceof Parse.Error)
          err = new Error(
            `Error running cloud function ${name}: ${err.code}, ${err.message}`
          );
        else
          err = new NestedError(
            `Error running cloud function ${name}: ${err.message}`,
            err
          );
        reject(err);
      });
  });
}

function userCreateWithAccount() {
  const username = uuid();
  const password = uuid();
  return invokeCloudFunction("userCreateWithAccount", {
    user: {
      username,
      password,
    },
    install: {
      device: "foo",
      appIdentifier: "my.coolapp",
      localeIdentifier: "en-US",
    },
  })
    .then(function(result) {
      return result;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
}

function mkValidObject(account) {
  const ret = new MyClass();

  ret.set("field1", uuid());
  ret.set("field2", uuid());
  ret.set("field3", uuid());
  ret.set("field4", uuid());
  ret.set("field5", uuid());

  return ret;
}