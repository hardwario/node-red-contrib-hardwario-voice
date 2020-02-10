module.exports = function(RED) {
  const firebase = require("firebase");
  const firestore = require("firebase/firestore");
  const pjson = require("../package.json");

  firebase.initializeApp({
    apiKey: "AIzaSyBZn9O5CeqsiJLKsKXwyEoWG7VNP0Cs3lY",
    authDomain: "AIzaSyBZn9O5CeqsiJLKsKXwyEoWG7VNP0Cs3lY",
    projectId: "bigclown-e3802"
  });

  const db = firebase.firestore();

  let lastSentMessage = {};
  let isConnected = true;

  function HardwarioAssistantNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.configNode = RED.nodes.getNode(config.cred);
    if (this.configNode.phrase) {
      const phrase = this.configNode.phrase;
      this.status({ fill: "yellow", shape: "ring", text: "Connecting ..." });
      fetch(
        `https://us-central1-bigclown-e3802.cloudfunctions.net/updateModulesOnPairingFn?userId=${phrase}&version=${encodeURIComponent(
          pjson.version
        )}`
      )
        .then(response => {
          if (response.status === 200) {
            node.send(response.body);
            isConnected = true;
          } else if (response.status === 400) {
            node.status({ fill: "red", shape: "ring", text: "Pairing error" });
            isConnected = false;
            console.log(`Error: ${response.body.payload}`);
            return node.send(response.body);
          } else {
            this.status({ fill: "red", shape: "ring", text: "Pairing error" });
            isConnected = false;
            console.log(`Error: Pairing failed, check the Auth token.`);
            return node.send({
              topic: "node/assistant/error",
              payload: "Pairing failed, check the Auth token."
            });
          }
          const receiver = db
            .collection(`users/${phrase}/updates`)
            .onSnapshot(function(querySnapshot) {
              querySnapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
                  const msg = {};
                  msg.payload = change.doc.data().payload;
                  msg.topic = change.doc.data().topic;
                  msg.fromGA = change.doc.data().fromGA;
                  if (
                    lastSentMessage.topic === msg.topic &&
                    lastSentMessage.payload === msg.payload
                  ) {
                    return db
                      .doc(`users/${phrase}/updates/${change.doc.id}`)
                      .delete()
                      .then(() => {
                        return;
                      })
                      .catch(error => {
                        console.log(error);
                        node.status({
                          fill: "red",
                          shape: "ring",
                          text: "error"
                        });
                      });
                  }
                  lastSentMessage = { topic: msg.topic, payload: msg.payload };

                  return db
                    .doc(`users/${phrase}/updates/${change.doc.id}`)
                    .delete()
                    .then(() => {
                      console.log(`Sending ${JSON.stringify(msg)}`);
                      if (msg.topic === "node/assistant/disconnect") {
                        node.status({
                          fill: "red",
                          shape: "ring",
                          text: msg.payload
                        });
                        node.send(msg);
                        receiver();
                      }
                      return node.send(msg);
                    })
                    .catch(error => {
                      console.log(error);
                      node.status({
                        fill: "red",
                        shape: "ring",
                        text: "error"
                      });
                    });
                }
              });
            });
          node.status({ fill: "green", shape: "dot", text: "connected" });
        })
        .catch(error => {
          console.log(`Pairing error: ` + error);
          isConnected = false;
          node.status({ fill: "red", shape: "ring", text: "Pairing error" });
        });

      node.on("input", function(msg) {
        if (
          lastSentMessage.topic === msg.topic &&
          lastSentMessage.payload === msg.payload
        ) {
          return;
        } else {
          console.log(`Received: ${JSON.stringify(msg)}`);
          if (!isConnected) {
            return;
          }
          fetch(
            `https://us-central1-bigclown-e3802.cloudfunctions.net/updateModuleOnPostFn?userId=${phrase}&topic=${encodeURIComponent(
              msg.topic
            )}&payload=${encodeURIComponent(msg.payload)}`
          );
        }
      });
    } else {
      node.status({ fill: "red", shape: "ring", text: "Missing token" });
      return;
    }
  }
  RED.nodes.registerType("hardwario-voice", HardwarioAssistantNode);
};
