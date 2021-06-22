import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs'
import { register } from 'ts-node'
import { TS_FUNC_CONFIG } from './Constants'
import { scriptFile } from './ScriptFile'
import { TsFuncCase, TsFuncOptions, TsFuncRc, TsFuncRcHook } from './Types'

/** Compile .tsfuncrc in the current working directory. */
export async function compile (overrideOptions?: TsFuncOptions): Promise<void> {
  const tsFuncRc = await getTsFuncRc()
  const options = getOptions(tsFuncRc, overrideOptions)
  const hooks: Promise<TsFuncRcHook>[] = []

  /** Queue up resolving all functions and promises to hooks. */
  for (const [key, value] of Object.entries(tsFuncRc)) {
    if (key === 'default') continue

    switch (typeof value) {
      case 'function':
        hooks.push((
          async (): Promise<TsFuncRcHook> => {
            const config = await value()

            if (!options.ignoreScripts && typeof config.scriptFile === 'string') {
              config.scriptFile = await scriptFile(config.scriptFile)
            }

            return {
              name: getName(key, options.case),
              path: options.rootDir ?? process.cwd(),
              config
            }
          }
        )())
        break
      case 'object':
        hooks.push((
          async (): Promise<TsFuncRcHook> => {
            if (!options.ignoreScripts && typeof value.scriptFile === 'string') {
              value.scriptFile = await scriptFile(value.scriptFile)
            }

            return {
              name: getName(key, options.case),
              path: options.rootDir ?? process.cwd(),
              config: value
            }
          }
        )())
    }
  }

  /** One-by-one, await each promise and handle the resolved hook. */
  for await (const hook of hooks) {
    const dir = `${hook.path}/${hook.name}`

    if (!options.noEmit) {
      if (existsSync(dir)) {
        rmdirSync(dir, { recursive: true })
      }

      mkdirSync(dir, { recursive: true })
      writeFileSync(`${dir}/function.json`, JSON.stringify(hook.config, null, 2))
    }
  }
}

/** Cleanup the emitted files and directories from .tsfuncrc in the current working directory. */
export async function cleanup (overrideOptions?: TsFuncOptions): Promise<void> {
  const tsFuncRc = await getTsFuncRc()
  const options = getOptions(tsFuncRc, overrideOptions)

  // If not persist, delete all files.
  if (!(options.persist ?? false)) {
    for (const key of Object.keys(tsFuncRc)) {
      if (key === 'default') continue

      const dir = `${options.rootDir ?? process.cwd()}/${getName(key, options.case)}`
  
      if (existsSync(dir)) {
        rmdirSync(dir, { recursive: true })
      }
    }
  }
}

function toPascalCase (name: string): string {
  return name.split(/[-_]/gu)
    .filter(part => part.trim() !== '')
    .map(part => part.charAt(0).toUpperCase() + part.substring(1))
    .join('')
}

function toCamelCase (name: string): string {
  const pascalCase = toPascalCase(name)

  return pascalCase.charAt(0).toLowerCase() + pascalCase.substring(1)
}

function getName (name: string, toCase?: TsFuncCase) {
  switch (toCase) {
    case 'none':
      return name
    case 'pascal':
      return toPascalCase(name)
    case 'camel':
    default:
      return toCamelCase(name)
  }
}

async function getTsFuncRc (): Promise<TsFuncRc> {
  await register()

  return await import(`${process.cwd()}/${TS_FUNC_CONFIG}`)
}

function getOptions (tsFuncRc: TsFuncRc, overrideOptions?: TsFuncOptions): TsFuncOptions {
  const providedOptions: TsFuncOptions = typeof tsFuncRc?.default === 'undefined' ? {} : tsFuncRc.default
  overrideOptions = overrideOptions ?? {}

  return {
    ...providedOptions,
    ...overrideOptions
  }
}
