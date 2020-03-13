let Utils = () => {
  let checkIfArray = arr => {
    try {
      arr = arr.replace(/'/g, '"');
      arr = arr.replace(/`/g, '"');
      let replacing = /\""(.*?)\""/g;
      let replacedData = arr.match(replacing);
      if (replacedData && replacedData.length > 0) {
        for (let i = 0; i < replacedData.length; i++) {
          const elem = replacedData[i];

          let parsed = '"&' + elem.substring(2, elem.length - 2) + '&"';
          arr = arr.replace(elem, parsed);
        }
      }

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
          } else {
            element.payload = element.payload.replace(/&/g, '"');
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
  };
  return { checkIfArray };
};
module.exports = Utils();
