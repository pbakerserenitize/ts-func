import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs'
import { register } from 'ts-node'
import { TS_FUNC_CONFIG } from './Constants'
import { TsFuncCase, TsFuncOptions, TsFuncRc, TsFuncRcHook } from './Types'

/** Compile .tsfuncrc in the current working directory. */
export async function compile (): Promise<void> {
  const tsFuncRc = await getTsFuncRc()
  const options = getOptions(tsFuncRc)
  const hooks: Promise<TsFuncRcHook>[] = []

  for (const [key, value] of Object.entries(tsFuncRc)) {
    if (key !== 'default') {
      switch (typeof value) {
        case 'function':
          hooks.push((
            async (): Promise<TsFuncRcHook> => {
              return {
                name: getName(key, options.case),
                path: options.rootDir ?? process.cwd(),
                config: await value()
              }
            }
          )())
          break
        case 'object':
          hooks.push((
            async (): Promise<TsFuncRcHook> => {
              return {
                name: getName(key, options.case),
                path: options.rootDir ?? process.cwd(),
                config: value
              }
            }
          )())
      }
    }
  }

  for await (const hook of hooks) {
    const dir = `${hook.path}/${hook.name}`

    if (existsSync(dir)) {
      rmdirSync(dir, { recursive: true })
    }

    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/function.json`, JSON.stringify(hook.config, null, 2))
  }
}

/** Cleanup the emitted files and directories from .tsfuncrc in the current working directory. */
export async function cleanup (): Promise<void> {
  const tsFuncRc = await getTsFuncRc()
  const options = getOptions(tsFuncRc)

  for (const key of Object.keys(tsFuncRc)) {
    const dir = `${options.rootDir ?? process.cwd()}/${getName(key, options.case)}`

    if (existsSync(dir)) {
      rmdirSync(dir, { recursive: true })
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

function getOptions (tsFuncRc: TsFuncRc): TsFuncOptions {
  return typeof tsFuncRc?.default === 'undefined' ? {} : tsFuncRc.default
}
