import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination-controls mt-4 d-flex justify-content-center">
      <button
        className="btn btn-outline-primary me-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="mx-3">Page {currentPage} of {totalPages}</span>
      <button
        className="btn btn-outline-primary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}