const Parse = require("parse/node");
const uuid = require("uuid").v1;
const Account = Parse.Object.extend("Account");

async function createWithAccount(userData, installData) {
  // init user
  const newUser = new Parse.User();
  newUser.set("username", userData.username);
  newUser.set("password", userData.password);
  newUser.set("app", userData.app);
  newUser.set("countryCode", userData.countryCode);
  newUser.set("email", userData.email);
  newUser.set("firstName", userData.firstName);
  newUser.set("lastName", userData.lastName);

  //  init install
  const installationId = uuid();
  const newInstall = new Parse.Installation();
  newInstall.set("installationId", installationId);
  newInstall.set("deviceType", installData.deviceType || "web");
  newInstall.set("appName", "MySuperApp");
  newInstall.set("device", installData.device);
  newInstall.set("appIdentifier", installData.appIdentifier);
  newInstall.set("appVersion", installData.appVersion);
  newInstall.set("localeIdentifier", installData.localeIdentifier);
  
  
  const newAccount = new Account();

  const user = await newUser.save();

  const userPointer = new Parse.User();
  userPointer.id = user.id;
  newInstall.set("user", userPointer);

  // relate account to user, no need to save the account yet, parse will do that recursively for us
  user.set("account", newAccount);

  // Bit of a hack, need to tell accountBeforeSave who the user is, since we're saving with master key
  newAccount.set("masterKeyUser", userPointer);

  // We use the master key to improve performance, saves ACLs checks (I *think*)
  // we pass the user in as a bit of a hack, in newAccount.masterKeyUser
  const saveOpts = { useMasterKey: true };
  // save install + user
  const [install, userWithAccount] = await Parse.Object.saveAll(
    [newInstall, user],
    saveOpts
  );

  // return, not sure why we need the Casts here...
  return {
    user: userWithAccount,
    install: install,
  };
}

Parse.Cloud.define(
  "userCreateWithAccount",
  async function userCreateWithAccount(request) {
    const params = request.params;

    // validate user params
    const userData = params.user;
    if (!userData.username) {
      throw new Error("user.username required");
    }
    if (!userData.password) {
      throw new Error("user.password required");
    }

    //  validate install params
    const installData = params.install;
    if (!installData.device) {
      throw new Error("install.device required");
    }
    if (!installData.appIdentifier) {
      throw new Error("install.appIdentifier required");
    }
    if (!installData.localeIdentifier) {
      throw new Error("install.localeIdentifier required");
    }
    // respond
    return createWithAccount(userData, installData).catch((err) => {
      throw new Parse.Error(
        err.code,
        `Error creating new user with account ${err.code}: ${err.message}`
      );
    });
  }
);
