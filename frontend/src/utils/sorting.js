export const sortData = (data, key, currentSort) => {
    const direction = currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc';
    
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    return {
      sortedData,
      newSort: { key, direction }
    };
  };
  
  export const getSortIcon = (column, sortConfig) => {
    if (sortConfig.key !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };