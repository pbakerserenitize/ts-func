# ts-func

Generate Azure Function App Configs from TypeScript and JavaScript!

## How it works

Define a JavaScript or TypeScript file at the root of your project named `.tsfuncrc`; can be either `.js` or `.ts`.

This file is the configuration entry point for generating folders and `function.json` files in the root of the current working directory with a scheme of `<EXPORT_NAME>/function.json`. Function configurations must be named exports of either an object implementing `AzureFunctionSchema` or a function which returns `AzureFunctionSchema` object. Function exports may be either synchronous or async, they'll be `await`-ed either way.

Additional options may be passed to `ts-func` by exporting a default object with the options defined as desired. These options will be merged with the internal defaults and used when generating the Function App configurations. The options must be either `export default` in TypeScript, or explicitly named `default` in JavaScript in order to be picked up and not treated like a function configuration.

This config file is usable code; you can do anything you want, including importing the Azure Function Schema objects from other files and entry points, so long as the desired exports are **named** and follow the criteria outlined above.

See the sample `.tsfuncrc.ts` in the root of this project for inspiration.

Requires Node v12 or better.
