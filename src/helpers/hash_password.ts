import * as argon2 from "argon2"

export const HASH_ASYNC = async (string_to_hash: string) => await argon2.hash(string_to_hash)

export const HASH_COMPARE_ASYNC = async (hash: string, string_to_verify: string) => {
    return await argon2.verify(hash, string_to_verify)
}
