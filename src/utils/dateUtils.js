export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';

  // Check if likely ISO/Timestamp/Date object
  const isISO = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString);
  const isTimestamp = typeof dateString === 'number';
  const isDateObj = dateString instanceof Date;

  if (isISO || isTimestamp || isDateObj) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  return dateString;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const isISO = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString);
  const isTimestamp = typeof dateString === 'number';
  const isDateObj = dateString instanceof Date;

  if (isISO || isTimestamp || isDateObj) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return dateString;
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';

  const isISO = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString);
  const isTimestamp = typeof dateString === 'number';
  const isDateObj = dateString instanceof Date;

  if (isISO || isTimestamp || isDateObj) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  return dateString;
};
