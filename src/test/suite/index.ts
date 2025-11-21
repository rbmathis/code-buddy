import * as path from "path";
import * as fs from "fs";
import * as Mocha from "mocha";

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: "bdd", color: true });
  const testsRoot = __dirname;

  // Add all test files under this directory
  fs.readdirSync(testsRoot)
    .filter((file) => file.endsWith(".test.js"))
    .forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

  return new Promise((resolve, reject) => {
    mocha.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
