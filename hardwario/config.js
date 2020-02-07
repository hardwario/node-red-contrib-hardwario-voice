let init = false;

module.exports = function(RED) {
  function HardwarioConfig(n) {
    RED.nodes.createNode(this, n);
    this.phrase = n.phrase;
    this.name = n.name;

    if (!init) {
      console.log(`Getting user... `);
      init = true;
      let global = this.context().global;
    }
  }
  RED.nodes.registerType("hardwario-config", HardwarioConfig);
};
