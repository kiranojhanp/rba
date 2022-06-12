// O(log n) function to find index of an item in provided array
const findIndexOf = (numbers: string[] | number[], target: string | number): Promise<number> => {
    return new Promise((resolve, reject) => {
        let min = 0
        let max = numbers.length - 1
        let guess: number

        while (max >= min) {
            guess = Math.floor((min + max) / 2)
            if (numbers[guess] === target) resolve(guess)
            if (numbers[guess] < target) min = guess + 1
            else max = guess - 1
        }

        reject(-1)
    })
}

// check if item exists
const checkIfExists = (numbers: string[] | number[], target: string | number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        findIndexOf(numbers, target)
            .then((val) => {
                if (val !== -1) return resolve(true)
            })
            .catch(() => reject(false))
    })
}

export { findIndexOf, checkIfExists }
