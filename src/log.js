const getLocalTimestamp = () => {
    const currentTime = new Date();

    const date = currentTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const time = currentTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return `${date} ${time}`;  // Local date and time in 'MM/DD/YYYY HH:MM:SS' format
};

const log = (methodName, messageType, statusCode, message) => {
    const timeStamp = getLocalTimestamp();  // Use local timestamp
    const logMessage = `[${timeStamp}] - [${methodName}] [${messageType}] [${statusCode}] ${message}`;
    
    // Ensure this is logging the message
    console.log('Logging message:', logMessage);
    
    // Log the message to the console
    console.log(logMessage);

    // Send the log message to the backend /api/log
    fetch('http://localhost:3001/api/log', {  // Ensure correct server URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ methodName, messageType, statusCode, message, timeStamp }),
    })
    .then(response => response.json())
    .then(data => console.log('Log saved successfully:', data))
    .catch(error => {
        console.error('Failed to send log:', error);
    });
};

export default log;
