import { useState, useCallback } from 'react';

export function usePagination(initialSize = 20) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);

  const totalPages = Math.ceil(totalElements / size);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage((p) => p + 1);
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage((p) => p - 1);
  }, [page]);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  return {
    page, size, totalElements, totalPages,
    setPage, setSize, setTotalElements,
    nextPage, prevPage, goToPage,
  };
}
