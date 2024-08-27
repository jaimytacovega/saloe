const getKV = ({ env, kv }) => env[kv]

const getKVResponse = async ({ env, kv, key }) => {
    const result = await getFromKV({ env, kv, key })
    if (result?.err) return result

    const response = new Response(result?.data)
    return { response }
}

const getFromKV = async ({ env, kv, key }) => {
    try {
        const data = await getKV({ env, kv }).get(key)
        return { data }
    } catch (err) {
        return { err }
    }
}

const putInKV = async ({ env, kv, key, data }) => {
    try {
        const result = await getKV({ env, kv }).put(key, data)
        return result
    } catch (err) {
        return { err }
    }
}

export {
    getFromKV,
    putInKV,

    getKVResponse,

    getKV,
}