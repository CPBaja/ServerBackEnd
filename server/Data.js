let sp = require("synchronized-promise");
/*
module.exports = async () => {
    require()

};
*/
module.exports = async function load(){
    await require("./Data/DB").initialize();
    await require("./Data/DataLoader").initialize();
};