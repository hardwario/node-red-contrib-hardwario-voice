module.exports = function(RED) {
  const { checkIfArray } = require("./utils");
  function SceneConfigNode(config) {
    RED.nodes.createNode(this, config);
    const { name, nicknames, reversible, reverseCommands, commands } = config;
    const msg = {};
    msg.valid = true;
    let reverseCmds, cmds;
    try {
      const arrData = checkIfArray(commands);
      if (arrData.valid) {
        cmds = arrData.obj;
      } else {
        msg.valid = false;
        msg.reason = "Invalid JSON - commands";
      }

      if (reversible && reverseCommands) {
        const reverseCommandsData = checkIfArray(reverseCommands);
        if (reverseCommandsData.valid) {
          reverseCmds = reverseCommandsData.obj;
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
