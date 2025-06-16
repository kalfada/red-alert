const parseDate = (dateString: string, sec = false): string => {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return dateString; // Return the original string if invalid
        // throw new Error(`Invalid date string provided: ${dateString}`);
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}-${day} ${hours}:${minutes}${sec ? `:${seconds}` : ''}`;
}

export default parseDate;