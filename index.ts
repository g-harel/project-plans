import { glob } from "npm:glob@10.3.1";

const wireframes: string[] = await glob("**/wireframe.png");

const readme = `
# Project Plans

${wireframes.map((img) => `<img src="${img}" width="30%"/>`).join("\n")}

## LICENSE

[MIT](./LICENSE)
`.trim() + "\n";

await Deno.writeTextFile("./README.md", readme);
