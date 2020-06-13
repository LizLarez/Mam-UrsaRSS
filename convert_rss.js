var fs = require("fs");
var convert = require("xml-js");
var saxon = require("saxon-js");
var options = { ignoreComment: true, alwaysChildren: true };

console.log(process.argv)

if(process.argv.length != 4) {
    console.log("Usage: node convert_rss.js <input_atom_file> <output_rss_file>")
    return 1;
}

var xml = saxon.transform(
  {
    stylesheetFileName: "atom2rss.sef.json",
    sourceFileName: process.argv[2],
    destination: "serialized",
  },
  "sync"
).principalResult;
console.log("atom converted to rss");

var jsData = convert.xml2js(xml, options);
console.log("rss to js");

jsData.elements[0].elements[0].elements
  .filter((e) => e.name === "item")
  .forEach((e) => {
    var newPriceEl = JSON.parse(
      JSON.stringify(e.elements.filter((e) => e.name === "title")[0])
    );
    var priceEl = e.elements
      .filter((e) => e.name === "s:variant")[0]
      .elements.filter((e) => e.name === "s:price")[0];
    var price = priceEl.elements[0].text;
    var curr = priceEl.attributes.currency;

    newPriceEl.name = "price";
    newPriceEl.elements[0].text = price + curr;
    e.elements.push(newPriceEl);
  });
console.log("added price to js");

var xmlData = convert.js2xml(jsData);
console.log("js to rss");

fs.writeFile(process.argv[3], xmlData, function (err, file) {
  if (err) throw err;
  console.log("All done");
});
