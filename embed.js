import Embed from "./Embed.svelte";

// Get the script element that includes the embed.js file
const script = document.currentScript;

// Get the 'name' attribute from the script tag We can pass things like API keys
const apikey = script.getAttribute("apikey");

const div = document.createElement("div");
document.body.appendChild(div);

const embed = new Embed({
  target: div,
  props: { apikey },
});
