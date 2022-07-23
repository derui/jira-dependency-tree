import fs from 'fs';
import path from 'path'
import typescript from 'typescript'
import { createMatchPath } from 'tsconfig-paths'

const { readConfigFile, parseJsonConfigFileContent, sys } = typescript

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const configFile = readConfigFile('./tsconfig.json', sys.readFile)
if (typeof configFile.error !== 'undefined') {
  throw new Error(`Failed to load tsconfig: ${configFile.error}`)
}

const { options } = parseJsonConfigFileContent(
  configFile.config,
  {
    fileExists: sys.fileExists,
    readFile: sys.readFile,
    readDirectory: sys.readDirectory,
    useCaseSensitiveFileNames: true,
  },
  __dirname
)

const matchPath = createMatchPath(options.baseUrl, options.paths)

const extensionsRegex = /\.ts$|\.tsx$/;

export async function load(url, context, defaultLoad) {
  if (extensionsRegex.test(url)) {
    const { source } = await defaultLoad(url, { format: 'module' });
    return {
      format: 'commonjs',
      source: source,
    };
  }
  // let Node.js handle all other URLs
  return defaultLoad(url, context, defaultLoad);
}

export async function resolve(specifier, context, defaultResolve) {
  const matchedSpecifier = matchPath(specifier)
  return defaultResolve(
    matchedSpecifier ? `${matchedSpecifier}` : specifier,
    context,
    defaultResolve
  )
}
