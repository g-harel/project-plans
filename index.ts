import { glob } from 'npm:glob@10.3.1';

const wireframes = await glob("**/wireframe.png");
console.log(wireframes);

