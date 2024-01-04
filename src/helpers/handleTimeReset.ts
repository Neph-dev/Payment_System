

export const resetTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0)
}