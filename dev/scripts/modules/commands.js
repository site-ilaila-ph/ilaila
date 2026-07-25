import { spawn } from 'node-pty';
import { projectRoot } from './paths.js';
import { logger } from './singletons.js';

function command(command, args = [], options = {})  {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, ...options });

    let output = '';

    child.onData(data => {
      output += data;
      logger.asIs.log(data);
    });

    child.onExit(({ exitCode, signal }) => {
      resolve({ exitCode, signal, output });
    })
  });
}

export { command };