import { promises as fsPromises, stat as fsStat, unlinkSync, existsSync, renameSync } from 'fs'
import { join, resolve } from 'path'


const listFiles = async ({ path }) => {
    let allFiles = []

    try {
        const files = await fsPromises.readdir(path)

        for (const file of files) {
            const filePath = join(path, file)
            const fileStats = await fsPromises.stat(filePath)

            if (fileStats.isDirectory()) {
                const subDirFiles = await listFiles({ path: filePath }) // Recursively list files in subdirectories
                allFiles = allFiles.concat(subDirFiles)
            } else {
                allFiles.push(filePath) // Add file path to the array
            }
        }
    } catch (err) {
        console.error('Error reading directory:', err)
    }

    return allFiles
}

const writeFile = async ({ code, filePath }) => {
    try {
        await fsPromises.writeFile(filePath, code)
        console.info(`File '${filePath}' has been created`)
    } catch (err) {
        console.error('Error writing file:', err)
    }
}

const removeFile = ({ filePath }) => {
    try {
        if (existsSync(filePath)) {
            unlinkSync(filePath)
            console.info(`File removed: ${filePath}`)
        } else {
            console.info(`File does not exist: ${filePath}`)
        }
    } catch (err) {
        console.error(err)
    }
}

const getComponentFilePaths = ({ source }) => listFiles({ path: `src/${source}/` })

const getImportCode = async ({ sources }) => {
    let acumIndex = 0
    return Promise.all(
        (sources ?? [])?.map(async (source, sourceIndex) => {
            const filePaths = await getComponentFilePaths({ source })
            const code = filePaths?.map((path, index) => {
                if (!path?.includes('/actions/')) return ''
                if (!path?.endsWith('.js')) return ''
                acumIndex++
                const importPath = path?.replace(`src/${source}`, `@/${source}`)?.replace('.js', '')
                return `import * as A${acumIndex} from '${importPath}'\nconsole.log(A${acumIndex})\n`
            })?.join('')

            return { filePaths, code }
        })
    )
}


const getURLPath = ({ path }) => new URL(`${path}`, import.meta.url).pathname

const getInputPaths = async ({ sources }) => {
    try {
        const componentsInfos = await getImportCode({ sources })

        const actionImportCode = `${componentsInfos?.map((componentsInfo) => componentsInfo?.code)?.join('\n')}`
        const actionsFilePath = 'src/_actions_autogenerated.js'

        await writeFile({ code: actionImportCode, filePath: actionsFilePath })

        const paths = {
            ...componentsInfos?.reduce((acc1, componentsInfo) => {
                acc1 = {
                    ...acc1,
                    ...componentsInfo?.filePaths?.reduce((acc, componentFilePath) => {
                        if (componentFilePath?.endsWith('.js') && !componentFilePath?.includes('/actions/')) return acc
                        const fileName = componentFilePath?.split('/')?.pop()
                        const componentName = fileName?.replace(/\.[^.]+$/, '')
                        acc[componentName] = getURLPath({ path: componentFilePath })
                        return acc
                    }, {})
                }
                return acc1
            }, {}),
            actionsFilePath: getURLPath({ path: actionsFilePath }),
            // 'sw.worker': getURLPath({ path: '/src/sw.worker.js' }),
        }

        return paths
    } catch (err) {
        console.error(err)
        return {}
    }
}

const closeBundle = async () => {
    const distFilePaths = await listFiles({ path: 'dist/' })
    const cleanedDistFilePaths = distFilePaths?.filter((path) => !path?.endsWith('.DS_Store'))

    await writeFile({ code: JSON.stringify(cleanedDistFilePaths), filePath: 'dist/dist.json' })
}

const getPlugin = () => {
    return [
        {
            name: 'postbuild-command',
            closeBundle,
        },
    ]
}

export {
    getInputPaths,
    getPlugin,
}