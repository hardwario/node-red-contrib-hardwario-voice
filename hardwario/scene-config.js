module.exports = function(RED) {
  function checkIfArray(arr) {
    try {
      let obj = JSON.stringify(arr);
      obj = JSON.parse(obj);
      obj = JSON.parse(obj);

      if (Array.isArray(obj)) {
        let isOkay = true;
        obj.forEach(element => {
          if (
            element.payload === null ||
            element.topic === null ||
            element.topic === undefined ||
            element.payload === undefined
          ) {
            isOkay = false;
          }
        });

        if (isOkay) {
          return { obj: obj, valid: true };
        } else {
          return { obj: null, valid: false };
        }
      } else {
        return { obj: null, valid: false };
      }
    } catch (error) {
      console.log(error);
      return { obj: null, valid: false };
    }
  }

  function SceneConfigNode(config) {
    RED.nodes.createNode(this, config);
    const { name, nicknames, reversible, reverseCommands, commands } = config;
    const msg = {};
    msg.valid = true;
    let reverseCmds, cmds;
    try {
      const arrData = checkIfArray(commands.replace(/'/g, '"'));
      if (arrData.valid) {
        cmds = arrData.obj;
      } else {
        msg.valid = false;
        msg.reason = "Invalid JSON - commands";
      }

      if (reversible && reverseCommands) {
        const reverseCommandsData = checkIfArray(reverseCommands.replace(/'/g, '"'));
        if (reverseCommandsData.valid) {
          cmds = reverseCommandsData.obj;
        } else {
          msg.valid = false;
          msg.reason = "Invalid JSON - reverse commands";
        }
      } else if (reversible && !reverseCommands) {
        msg.valid = false;
        msg.reason = "Reverse commands missing";
      }
    } catch (error) {
      msg.valid = false;
      msg.reason = "Incorrect JSON";
    }
    if (!name) {
      msg.valid = false;
      msg.reason = "Name missing";
    }

    if (!commands) {
      msg.valid = false;
      msg.reason = "Commands missing";
    }

    const id = name.replace(/\s/g, "").toLowerCase();
    msg.payload = {
      name: name,
      id: id,
      alias: id,
      commands: cmds,
      reversible: false
    };
    if (reversible && Array.isArray(reverseCmds)) {
      msg.payload.reversible = reversible;
      msg.payload.reverseCommands = reverseCmds;
    }
    if (nicknames) {
      if (nicknames.includes(",")) {
        let names = nicknames;
        names = names.split(",");
        names.forEach((element, idx) => {
          names[idx] = element.trim();
        });
        msg.payload.nicknames = names;
      } else {
        msg.payload.nicknames = [nicknames];
      }
    }
    msg.topic = `node/${id}/scene/-/set`;
    msg.payload = JSON.stringify(msg.payload);

    this.msg = msg;
  }
  RED.nodes.registerType("hardwario-scene-config", SceneConfigNode);
};
