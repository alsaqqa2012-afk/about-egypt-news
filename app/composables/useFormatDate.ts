export const useFormatDate = () => {
    const formatDate = (dateString: string): string =>
      new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Cairo',
        calendar: 'gregory',
      }).format(new Date(dateString))
  
    return { formatDate }
  }
  