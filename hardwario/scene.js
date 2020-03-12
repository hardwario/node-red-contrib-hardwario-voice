module.exports = function(RED) {
  var globalConfig;
  var globalNode;
  var sceneConfig;
  var fs = require("fs");
  var fileExists = false;

  function checkFile(msg) {
    fs.readFile("message.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
      }

      data = JSON.parse(data);
      if (msg.payload !== data.payload) {
        if (msg.valid) {
          globalNode.status({
            fill: "red",
            shape: "dot",
            text: "Press to update"
          });
        } else {
          globalNode.status({
            fill: "red",
            shape: "dot",
            text: msg.reason
          });
        }
      } else {
        globalNode.status({
          fill: "green",
          shape: "dot",
          text: "Up-to-date"
        });
      }
    });
  }

  function SceneNode(config) {
    RED.nodes.createNode(this, config);
    globalConfig = config;
    globalNode = this;
    sceneConfig = RED.nodes.getNode(globalConfig.scene);
    if (!sceneConfig) {
      this.status({
        fill: "red",
        shape: "ring",
        text: "Missing scene settings"
      });
      return;
    }

    const msg = sceneConfig.msg;
    if (!fileExists) {
      fs.writeFile("message.json", "[]", { flag: "wx" }, function(err) {
        if (err) {
          fileExists = true;
        }
        fileExists = true;
        checkFile(msg);
      });
    } else {
      checkFile(msg);
    }

    this.on("input", function(msg) {
      this.status({
        fill: "green",
        shape: "dot",
        text: "Updated"
      });
    });

    RED.httpAdmin.post(
      "/scene/:id",
      RED.auth.needsPermission("scene.write"),
      function(req, res) {
        var node = RED.nodes.getNode(req.params.id);

        const msg = sceneConfig.msg;
        if (!msg.valid) {
          globalNode.error(msg.reason, msg.reason);
          globalNode.status({
            fill: "red",
            shape: "dot",
            text: msg.reason
          });
          return res.sendStatus(500);
        }
        fs.readFile("message.json", "utf-8", (err, data) => {
          if (err) {
            console.log(err);
          }
          data = JSON.parse(data);
          if (msg.payload !== data.payload) {
            node.send(msg);
            fs.writeFile("message.json", JSON.stringify(msg), err => {
              if (err) console.log(err);
              node.receive();
              res.sendStatus(200);
            });
          } else {
            globalNode.status({
              fill: "green",
              shape: "dot",
              text: "Everything is up-to-date"
            });
            return res.sendStatus(200);
          }
        });
      }
    );
  }

  RED.nodes.registerType("hardwario-scene", SceneNode);
};
