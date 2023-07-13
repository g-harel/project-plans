import { glob } from "npm:glob@10.3.1";
import { dirname } from "https://deno.land/std/path/mod.ts";
import {
  ImageMagick,
  IMagickImage,
  initializeImageMagick,
} from "https://deno.land/x/imagemagick_deno@0.0.24/mod.ts";

await initializeImageMagick();

const wireframes: string[] = await glob("**/wireframe.png");

const getRootFromWireframe = (path: string) => {
  while (path.endsWith(".png") || path.endsWith("images")) {
    path = dirname(path);
  }
  return path;
};

const getWidth = async (img: string): Promise<number> => {
  const data: Uint8Array = await Deno.readFile(img);
  ImageMagick.read(data, (img: IMagickImage) => {
    console.log(img.baseWidth);
  });
  return 0;
}

const readme = `
# Project Plans

<p align="center">
${
  wireframes.map((img) =>
    "  " + `  
  <a href="./${getRootFromWireframe(img)}">
    <img src="${img}" ${getWidth(img)} width="45%"/>
  </a>`.trim()
  ).join("\n")
}
</p>

## LICENSE

[MIT](./LICENSE)
`.trim() + "\n";

await Deno.writeTextFile("./README.md", readme);
