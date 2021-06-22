import escalade from 'escalade'
import { existsSync, readFileSync } from 'fs'
import { basename, dirname, resolve, relative, join } from 'path'

const configCache = new Map<string, string | void>()

function normalizeScript (path: string): string {
  return path.replace(/\\/gu, '/').replace(/.ts$/gui, '.js')
}

/** A memoized function for returning the appropriate configuration path and import path. */
async function getBaseFiles (importPath: string, configName: string): Promise<[string | void, string | void]> {
  const importResolved = resolve(importPath)
  const importName = basename(importPath)
  const importDir = dirname(importResolved)
  const configHandler = async (): Promise<string | void> => {
    const key = `${importPath}::${configName}`
    const cached = configCache.get(key)

    if (typeof cached === 'string') return cached

    const result = await escalade(importResolved, async (dir, files) => files.includes(configName) ? configName : false)

    configCache.set(key, result)

    return result
  }

  try {
    // Search up the directory tree.
    return await Promise.all([
      configHandler(),
      escalade(importResolved, async (dir, files) => {
        return dir.toLowerCase() === importDir.toLowerCase() && files.includes(importName) ? importName : false
      })
    ])
  } catch (error) {
    // If we error it is for two reasons: 1) the file does not exist; or 2) no file permissions.
    // Either way, the file is inaccessible for compilation.
  }

  return [undefined, undefined]
}

async function typeScriptFile (path: string, altTSConfig?: string): Promise<string> {
  // Resolve import paths and tsconfig path.
  const configName = altTSConfig ?? 'tsconfig.json'
  const importPath = path.toLowerCase().endsWith('.ts') ? path : path + '.ts'
  const [tsconfig, importFile] = await getBaseFiles(importPath, configName)

  // if the paths were found, then calculate final output.
  if (typeof tsconfig === 'string' && typeof importFile === 'string') {
    const tsconfigJson = readFileSync(tsconfig, 'utf8')
    const tsOptions = JSON.parse(tsconfigJson)

    // If outDir exists in compiler options, use it.
    if (typeof tsOptions?.compilerOptions?.outDir === 'string') {
      const outDir: string = tsOptions?.compilerOptions?.outDir

      return normalizeScript(join('..', outDir, relative(dirname(tsconfig), importFile)))
    }

    return normalizeScript(join('..', relative(dirname(tsconfig), importFile)))
  }
}

async function javaScriptFile (path: string): Promise<string> {
  if (path.startsWith('../') && existsSync(path.substring(3))) {
    return path
  }

  // Resolve import paths and package.json path.
  const configName = 'package.json'
  const importPath = path.toLowerCase().endsWith('.js') ? path : path + '.js'
  const [npmconfig, importFile] = await getBaseFiles(importPath, configName)

  // if the paths were found, then calculate final output.
  if (typeof npmconfig === 'string' && typeof importFile === 'string') {
    return normalizeScript(join('..', relative(dirname(npmconfig), importFile)))
  }
}

/**
 * Returns a path that *should* always be relative to the working directory;
 * represents either the compiled TypeScript path for an import, or the normalized JavaScript path.
 * Returns `undefined` if the intermediate import or resulting path does not exist.
 */
export async function scriptFile (importPath: string, altTsconfig?: string): Promise<string> {
  if (typeof importPath === 'undefined') return

  let scriptPath: string

  if (importPath.toLowerCase().endsWith('.js')) {
    scriptPath = await javaScriptFile(importPath)
  } else {
    scriptPath = await typeScriptFile(importPath, altTsconfig)
  }

  if (typeof scriptPath === 'string') {
    // Remove the leading '../' to get the base path in the current working directory.
    const basePath = scriptPath.substring(3)

    if (existsSync(basePath)) return scriptPath
  }

  throw new Error(`Either provided or computed script file does not exist; provided '${importPath}', computed '${scriptPath}'.`)
}
