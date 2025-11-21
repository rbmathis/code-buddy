import * as path from "path";
import * as Mocha from "mocha";
import glob from "glob";

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: "bdd", color: true });
  // Look for compiled tests under out/test (suite + unit)
  const testsRoot = path.resolve(__dirname, ".." );

  const files = glob.sync("**/*.test.js", { cwd: testsRoot, absolute: true });
  files.forEach((file) => mocha.addFile(file));

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
