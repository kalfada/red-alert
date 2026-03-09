const parseDate = (dateString: string, sec = false): string => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    const dateStr = date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${dateStr} ${hours}:${minutes}${sec ? `:${seconds}` : ''}`;
}

export default parseDate;
